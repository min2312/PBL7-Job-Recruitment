import os
import sys

# Đảm bảo in được tiếng Việt trên Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import requests
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

# Thư viện cho hệ thống gợi ý (Chỉ thêm mới)
try:
    from sentence_transformers import SentenceTransformer
    import faiss
    from sklearn.linear_model import LogisticRegression
    from sklearn.feature_extraction.text import TfidfVectorizer
except ImportError:
    pass

# Cấu hình đường dẫn (Phân chia 2 khu vực AI)
BASE_URL = os.getenv('BACKEND_URL', 'http://localhost:8081')
SALARY_API = f'{BASE_URL}/api/neo4j/training-dataset'
RECOMMEND_API = f'{BASE_URL}/api/neo4j/recommendation-dataset'

from model_manager import get_and_sync_model_dir

MODEL_SALARY_DIR = get_and_sync_model_dir('salary')
MODEL_REC_DIR = get_and_sync_model_dir('recommendation')

LEVEL_MAPPING = {
    'Thực tập sinh': 1, 'Nhân viên': 2, 'Trưởng nhóm': 3,
    'Quản lý / Giám sát': 4, 'Trưởng/Phó phòng': 5,
    'Phó giám đốc': 6, 'Giám đốc': 7
}

EDU_MAPPING = {
    'Không yêu cầu': 0, 'Trung học cơ sở (Cấp 2) trở lên': 1,
    'Trung học phổ thông (Cấp 3) trở lên': 2, 'Trung cấp trở lên': 3,
    'Cao Đẳng trở lên': 4, 'Đại Học trở lên': 5
}

def fetch_data(days=None):
    url = SALARY_API
    if days:
        url = f"{SALARY_API}?days={days}"
    
    print(f"1. Đang gọi API lấy dữ liệu ({'Tất cả' if not days else f'Mới trong {days} ngày'})...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        json_data = response.json()
        if json_data['errCode'] == 0:
            return pd.DataFrame(json_data['data'])
        else:
            raise Exception("Lỗi từ API: " + json_data['errMessage'])
    except Exception as e:
        print(f"Lỗi API ({e}). Đang load tạm từ dataset.json nội bộ...")
        import json
        if os.path.exists('dataset.json'):
            with open('dataset.json', 'r', encoding='utf-8') as f:
                return pd.DataFrame(json.load(f)['data'])
        return pd.DataFrame()

def train_pipeline(days=None):
    os.makedirs(MODEL_SALARY_DIR, exist_ok=True)
    df = fetch_data(days)
    if df.empty:
        print("-> Không có dữ liệu mới để huấn luyện. Bỏ qua bước này.")
        return
        
    print(f"-> Đã tải thành công {len(df)} dòng dữ liệu.")

    # Ép kiểu chữ thành số điểm (Score) ngay từ đầu để dễ bề dọn rác
    df['level_score'] = df['level'].map(LEVEL_MAPPING).fillna(2)
    df['edu_score'] = df['education'].map(EDU_MAPPING).fillna(0)

    # ==========================================
    # BƯỚC 1: DỌN RÁC (ROBUST OUTLIER CLEANING)
    # ==========================================
    df['target_salary'] = df['target_salary'].replace([0, None], np.nan)
    
    # Áp dụng tri thức chuyên gia (Domain Knowledge) về chuẩn thị trường Việt Nam
    # Thực tập sinh (level 1): Mức hỗ trợ thực tế <= 5.0 triệu VNĐ. Các tin để > 5.0 là ảo / clickbait.
    df.loc[(df['level_score'] == 1) & (df['target_salary'] > 5.0), 'target_salary'] = 3.5
    # Nhân viên 0 năm kinh nghiệm (Fresher): Lương thực tế <= 12.0 triệu VNĐ. Các tin > 12.0 là ảo.
    df.loc[(df['experience_years'] == 0) & (df['level_score'] == 2) & (df['target_salary'] > 12.0), 'target_salary'] = 10.0
    
    # Tính toán trung vị mức lương theo cấp bậc và số năm kinh nghiệm
    df['grp_med'] = df.groupby(['level_score', 'experience_years'])['target_salary'].transform('median')
    df['grp_med'] = df['grp_med'].fillna(df.groupby('level_score')['target_salary'].transform('median'))
    
    # Loại bỏ các dữ liệu dị biệt nằm ngoài dải [75% median, 125% median]
    df = df[(df['target_salary'] >= df['grp_med'] * 0.75) & (df['target_salary'] <= df['grp_med'] * 1.25)].copy()

    # BƯỚC 2: FEATURE ENGINEERING
    df['exp_demand_power'] = df['experience_years'] * df['market_demand']

    features = ['category', 'location', 'level_score', 'edu_score', 'experience_years', 'market_demand', 'exp_demand_power']
    X = df[features].copy()
    y = np.log1p(df['target_salary'])

    categorical_cols = ['category', 'location']
    
    # Xác định có dùng huấn luyện tăng cường (Incremental) hay không để đồng bộ danh mục
    model_path = os.path.join(MODEL_SALARY_DIR, 'salary_predictor.pkl')
    mapping_path = os.path.join(MODEL_SALARY_DIR, 'category_mapping.pkl')
    
    is_incremental = False
    saved_categories = None
    if os.path.exists(model_path) and os.path.exists(mapping_path) and days is not None and days <= 7:
        try:
            saved_categories = joblib.load(mapping_path)
            is_incremental = True
            print("-> Phát hiện chế độ Incremental. Đồng bộ category_mapping từ mô hình cũ...")
        except Exception as e:
            print(f"-> Cảnh báo: Không thể load category_mapping cũ ({e}). Sẽ huấn luyện từ đầu.")
            is_incremental = False

    if is_incremental and saved_categories is not None:
        for col in categorical_cols:
            # Ép kiểu dữ liệu mới theo danh mục của mô hình cũ. Các category lạ/mới sẽ tự động thành NaN (không gây crash)
            X[col] = pd.Categorical(X[col], categories=saved_categories[col])
    else:
        for col in categorical_cols:
            X[col] = X[col].astype('category')
        # Lưu mapping mới khi huấn luyện từ đầu
        joblib.dump({col: X[col].cat.categories.tolist() for col in categorical_cols}, mapping_path)
        
    joblib.dump(LEVEL_MAPPING, os.path.join(MODEL_SALARY_DIR, 'level_mapping.pkl'))
    joblib.dump(EDU_MAPPING, os.path.join(MODEL_SALARY_DIR, 'edu_mapping.pkl'))

    if len(X) < 5:
        X_train, X_val, y_train, y_val = X, X, y, y
    else:
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    # BƯỚC 3: HUẤN LUYỆN TĂNG CƯỜNG / KHỞI TẠO LẠI
    monotone_constraints = {'level_score': 1, 'experience_years': 1, 'edu_score': 1}
    
    existing_model = None
    if is_incremental:
        print(f"-> Tìm thấy mô hình cũ, sẽ huấn luyện tiếp (Incremental Training)...")
        existing_model = joblib.load(model_path)
    else:
        print(f"-> Huấn luyện mô hình từ đầu với tập dữ liệu chuẩn hóa chất lượng cao...")

    print("2. Đang huấn luyện mô hình XGBoost...")
    model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=1.0,
        reg_lambda=3.0,
        monotone_constraints=monotone_constraints,
        enable_categorical=True,
        eval_metric='rmse',
        early_stopping_rounds=30
    )

    eval_set = [(X_train, y_train), (X_val, y_val)]
    model.fit(X_train, y_train, eval_set=eval_set, verbose=False, 
              xgb_model=existing_model.get_booster() if existing_model else None)

    # ĐÁNH GIÁ
    y_pred_vnd = np.expm1(model.predict(X_val))
    y_val_vnd = np.expm1(y_val)
    mae = mean_absolute_error(y_val_vnd, y_pred_vnd)
    rmse = np.sqrt(mean_squared_error(y_val_vnd, y_pred_vnd))
    r2 = r2_score(y_val_vnd, y_pred_vnd)
    
    print("\n=== KẾT QUẢ ĐÁNH GIÁ ===")
    print(f"MAE: {mae:.2f} triệu VNĐ")
    print(f"RMSE: {rmse:.2f} triệu VNĐ")
    print(f"R2 Score: {r2:.2f}")

    # GHI KẾT QUẢ VÀO FILE METRICS.TXT (GHI ĐÈ)
    metrics_path = os.path.join(MODEL_SALARY_DIR, 'metrics.txt')
    try:
        with open(metrics_path, 'w', encoding='utf-8') as f:
            f.write("=== KẾT QUẢ ĐÁNH GIÁ ===\n")
            f.write(f"MAE: {mae:.2f} triệu VNĐ\n")
            f.write(f"RMSE: {rmse:.2f} triệu VNĐ\n")
            f.write(f"R2 Score: {r2:.2f}\n")
        print(f"-> Đã lưu kết quả metric vào file: {metrics_path}")
    except Exception as e:
        print(f"Lỗi khi lưu file metrics.txt: {e}")

    # XUẤT BIỂU ĐỒ
    results = model.evals_result()
    if 'validation_0' in results:
        epochs = len(results['validation_0']['rmse'])
        x_axis = range(0, epochs)
        plt.figure(figsize=(10, 5))
        plt.plot(x_axis, results['validation_0']['rmse'], label='Train Loss')
        plt.plot(x_axis, results['validation_1']['rmse'], label='Val Loss')
        plt.legend()
        plt.title('Training Progress')
        plt.savefig(os.path.join(MODEL_SALARY_DIR, 'loss_chart.png'))

    joblib.dump(model, model_path)
    print(f"-> Đã xuất mô hình mới. Xong!")

# --- LOGIC GỢI Ý (RECO) ĐƯỢC TÁCH BIỆT ---
from reco_utils import clean_text, remove_accents
from sklearn.preprocessing import normalize

def update_recommendation_system(days=None):
    print("\n[RECO] Đang cập nhật hệ thống gợi ý...")
    os.makedirs(MODEL_REC_DIR, exist_ok=True)
    
    url = RECOMMEND_API
    if days: url = f"{RECOMMEND_API}?days={days}"
    
    try:
        r = requests.get(url)
        data = r.json().get('data', [])
        if not data:
            print("-> Không có job mới để cập nhật gợi ý.")
            return
        new_df = pd.DataFrame(data)
    except Exception as e:
        print(f"-> Lỗi khi lấy dữ liệu gợi ý: {e}")
        return

    df_path = os.path.join(MODEL_REC_DIR, 'df.pkl')
    index_path = os.path.join(MODEL_REC_DIR, 'faiss.index')
    
    if os.path.exists(df_path):
        old_df = joblib.load(df_path)
        new_df = new_df[~new_df['id'].isin(old_df['id'])]
        if new_df.empty:
            print("-> Tất cả job mới đã tồn tại trong Index.")
            return
        combined_df = pd.concat([old_df, new_df], ignore_index=True)
    else:
        combined_df = new_df

    # Đảm bảo có category_clean
    combined_df['category_clean'] = combined_df['category'].apply(clean_text)
    combined_df['job_title_clean'] = combined_df['job_title'].apply(clean_text)

    print(f"-> Đang đánh chỉ mục cho {len(new_df)} job mới...")
    model_st = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    # Notebook logic: job_title + chi_tiet_cong_viec
    new_texts = (new_df['job_title'].fillna('') + " " + new_df['chi_tiet_cong_viec'].fillna('')).tolist()
    # QUAN TRỌNG: normalize_embeddings=True
    new_embeddings = model_st.encode(new_texts, normalize_embeddings=True).astype('float32')

    if os.path.exists(index_path):
        index = faiss.read_index(index_path)
        index.add(new_embeddings)
    else:
        index = faiss.IndexFlatIP(new_embeddings.shape[1])
        index.add(new_embeddings)

    # 1. Train category classifier (clf) - Notebook: job_title_clean -> category
    print("-> Đang huấn luyện bộ phân loại ngành...")
    vectorizer_cls = TfidfVectorizer(max_features=5000, token_pattern=r"(?u)\b\w+\b", ngram_range=(1,2))
    X_vec = vectorizer_cls.fit_transform(combined_df['job_title_clean'])
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_vec, combined_df['category'])

    # 2. Tạo cat_vectorizer (để tìm ngành tương đương)
    print("-> Đang tạo bộ vector hóa ngành nghề...")
    unique_cats = combined_df['category_clean'].unique()
    cat_vectorizer = TfidfVectorizer(ngram_range=(1,2))
    cat_tfidf = cat_vectorizer.fit_transform(unique_cats)
    cat_tfidf = normalize(cat_tfidf)

    # 3. Location embeddings (optional but good to have)
    print("-> Đang tạo embedding vị trí...")
    location_embeddings = model_st.encode(combined_df['location'].fillna('').tolist(), normalize_embeddings=True)

    # Save all
    faiss.write_index(index, index_path)
    joblib.dump(combined_df, df_path)
    joblib.dump(clf, os.path.join(MODEL_REC_DIR, 'clf.pkl'))
    joblib.dump(vectorizer_cls, os.path.join(MODEL_REC_DIR, 'vectorizer_cls.pkl'))
    joblib.dump(cat_vectorizer, os.path.join(MODEL_REC_DIR, 'cat_vectorizer.pkl'))
    joblib.dump(cat_tfidf, os.path.join(MODEL_REC_DIR, 'cat_tfidf.pkl'))
    joblib.dump(unique_cats, os.path.join(MODEL_REC_DIR, 'unique_cats.pkl'))
    joblib.dump(location_embeddings, os.path.join(MODEL_REC_DIR, 'location_embeddings.pkl'))
    
    print("-> Cập nhật hệ thống gợi ý hoàn tất!")

if __name__ == "__main__":
    days_arg = None
    if len(sys.argv) > 1:
        try: days_arg = int(sys.argv[1])
        except: pass
    
    # 1. Huấn luyện Lương (Giữ nguyên logic của bạn)
    model_salary_path = os.path.join(MODEL_SALARY_DIR, 'salary_predictor.pkl')
    if os.path.exists(model_salary_path) and days_arg is None:
        days_arg = 1 # Mặc định của bạn
    
    train_pipeline(days=days_arg)
    
    # 2. Cập nhật Gợi ý (Phần thêm mới)
    try:
        update_recommendation_system(days=days_arg)
    except Exception as e:
        print(f"Cảnh báo: Lỗi cập nhật gợi ý: {e}")