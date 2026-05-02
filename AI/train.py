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
from sklearn.metrics import mean_absolute_error, r2_score

API_URL = 'http://localhost:8081/api/neo4j/training-dataset' # Đổi port nếu cần
MODEL_DIR = 'models'

LEVEL_MAPPING = {
    'Thực tập sinh': 1,
    'Nhân viên': 2,
    'Trưởng nhóm': 3,
    'Quản lý / Giám sát': 4,
    'Trưởng/Phó phòng': 5,
    'Phó giám đốc': 6,
    'Giám đốc': 7
}

EDU_MAPPING = {
    'Không yêu cầu': 0,
    'Trung học cơ sở (Cấp 2) trở lên': 1,
    'Trung học phổ thông (Cấp 3) trở lên': 2,
    'Trung cấp trở lên': 3,
    'Cao Đẳng trở lên': 4,
    'Đại Học trở lên': 5
}

def fetch_data(days=None):
    url = API_URL
    if days:
        url = f"{API_URL}?days={days}"
    
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
        with open('dataset.json', 'r', encoding='utf-8') as f:
            return pd.DataFrame(json.load(f)['data'])

def train_pipeline(days=None):
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = fetch_data(days)
    if df.empty:
        print("-> Không có dữ liệu mới để huấn luyện. Bỏ qua bước này.")
        return
        
    print(f"-> Đã tải thành công {len(df)} dòng dữ liệu.")

    # Ép kiểu chữ thành số điểm (Score) ngay từ đầu để dễ bề dọn rác
    df['level_score'] = df['level'].map(LEVEL_MAPPING).fillna(2)
    df['edu_score'] = df['education'].map(EDU_MAPPING).fillna(0)

    # ==========================================
    # BƯỚC 1: DỌN RÁC (RUTHLESS CLEANING)
    # ==========================================
    df['target_salary'] = df['target_salary'].replace([0, None], np.nan)
    
    df.loc[(df['level_score'] == 1) & (df['target_salary'] > 6), 'target_salary'] = np.nan
    df.loc[(df['experience_years'] == 0) & (df['target_salary'] > 12), 'target_salary'] = np.nan

    fallback_medians = {1: 3.5, 2: 12.0, 3: 18.0, 4: 25.0, 5: 35.0, 6: 50.0, 7: 80.0}
    
    level_medians = df.groupby('level_score')['target_salary'].median()
    df['target_salary'] = df.apply(
        lambda row: (level_medians.get(row['level_score']) 
                     if pd.notna(level_medians.get(row['level_score'])) 
                     else fallback_medians.get(row['level_score'], 15.0)) 
        if pd.isna(row['target_salary']) else row['target_salary'],
        axis=1
    )

    # BƯỚC 2: FEATURE ENGINEERING
    df['exp_demand_power'] = df['experience_years'] * df['market_demand']

    features = ['category', 'location', 'level_score', 'edu_score', 'experience_years', 'market_demand', 'exp_demand_power']
    X = df[features].copy()
    y = np.log1p(df['target_salary'])

    categorical_cols = ['category', 'location']
    for col in categorical_cols:
        X[col] = X[col].astype('category')

    joblib.dump(category_mapping := {col: X[col].cat.categories.tolist() for col in categorical_cols}, os.path.join(MODEL_DIR, 'category_mapping.pkl'))
    joblib.dump(LEVEL_MAPPING, os.path.join(MODEL_DIR, 'level_mapping.pkl'))
    joblib.dump(EDU_MAPPING, os.path.join(MODEL_DIR, 'edu_mapping.pkl'))

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    # BƯỚC 3: HUẤN LUYỆN TĂNG CƯỜNG (INCREMENTAL)
    monotone_constraints = {'level_score': 1, 'experience_years': 1, 'edu_score': 1}
    
    model_path = os.path.join(MODEL_DIR, 'salary_predictor.pkl')
    existing_model = None
    if os.path.exists(model_path):
        print(f"-> Tìm thấy mô hình cũ, sẽ huấn luyện tiếp (Incremental Training)...")
        existing_model = joblib.load(model_path)

    print("2. Đang huấn luyện mô hình XGBoost...")
    model = xgb.XGBRegressor(
        n_estimators=500,
        learning_rate=0.01,
        max_depth=4,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=2.0,
        reg_lambda=5.0,
        monotone_constraints=monotone_constraints,
        enable_categorical=True,
        eval_metric='rmse',
        early_stopping_rounds=50
    )

    eval_set = [(X_train, y_train), (X_val, y_val)]
    model.fit(X_train, y_train, eval_set=eval_set, verbose=False, 
              xgb_model=existing_model.get_booster() if existing_model else None)

    # ĐÁNH GIÁ
    y_pred_vnd = np.expm1(model.predict(X_val))
    y_val_vnd = np.expm1(y_val)
    mae = mean_absolute_error(y_val_vnd, y_pred_vnd)
    r2 = r2_score(y_val_vnd, y_pred_vnd)
    
    print("\n=== KẾT QUẢ ĐÁNH GIÁ ===")
    print(f"MAE: {mae:.2f} triệu VNĐ")
    print(f"R2 Score: {r2:.2f}")

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
        plt.savefig(os.path.join(MODEL_DIR, 'loss_chart.png'))

    joblib.dump(model, model_path)
    print(f"-> Đã xuất mô hình mới. Xong!")

if __name__ == "__main__":
    import sys
    days_arg = None
    if len(sys.argv) > 1:
        try: days_arg = int(sys.argv[1])
        except: pass
    
    model_path = os.path.join(MODEL_DIR, 'salary_predictor.pkl')
    if os.path.exists(model_path) and days_arg is None:
        days_arg = 1 # Mặc định lấy data ngày qua để update nếu đã có model
        
    train_pipeline(days=days_arg)