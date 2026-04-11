import os
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

def fetch_data():
    print(f"1. Đang gọi API lấy dữ liệu...")
    try:
        response = requests.get(API_URL)
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

def train_pipeline():
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = fetch_data()
    print(f"-> Đã tải thành công {len(df)} dòng dữ liệu.")

    # Ép kiểu chữ thành số điểm (Score) ngay từ đầu để dễ bề dọn rác
    df['level_score'] = df['level'].map(LEVEL_MAPPING).fillna(2)
    df['edu_score'] = df['education'].map(EDU_MAPPING).fillna(0)

    # ==========================================
    # BƯỚC 1: DỌN RÁC (RUTHLESS CLEANING)
    # Đây là cách làm Pure ML chuẩn: Sạch data trước khi học!
    # ==========================================
    df['target_salary'] = df['target_salary'].replace([0, None], np.nan)
    
    # Ép NaN cho những tin tuyển dụng ngáo giá (Intern > 6tr, Không exp > 12tr)
    df.loc[(df['level_score'] == 1) & (df['target_salary'] > 6), 'target_salary'] = np.nan
    df.loc[(df['experience_years'] == 0) & (df['target_salary'] > 12), 'target_salary'] = np.nan

    # Nội suy (Imputation) bằng mức trần thực tế (Domain Knowledge Fallback)
    # Thay vì lấp bằng trung bình 15tr của thị trường, ta ép mốc thực tế để AI học
    fallback_medians = {1: 3.5, 2: 12.0, 3: 18.0, 4: 25.0, 5: 35.0, 6: 50.0, 7: 80.0}
    
    # Lấp data: Đầu tiên thử lấp bằng Median của cấp bậc đó trong Data. Nếu Data bị nhiễu (NaN), lấy mốc thực tế đắp vào.
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
    y = np.log1p(df['target_salary']) # Dùng Log để AI không bị sốc số lớn

    categorical_cols = ['category', 'location']
    for col in categorical_cols:
        X[col] = X[col].astype('category')

    joblib.dump(category_mapping := {col: X[col].cat.categories.tolist() for col in categorical_cols}, os.path.join(MODEL_DIR, 'category_mapping.pkl'))
    joblib.dump(LEVEL_MAPPING, os.path.join(MODEL_DIR, 'level_mapping.pkl'))
    joblib.dump(EDU_MAPPING, os.path.join(MODEL_DIR, 'edu_mapping.pkl'))

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    # BƯỚC 3: HUẤN LUYỆN VỚI KHIÊN BẢO VỆ CỰC MẠNH
    # Ràng buộc đơn điệu: Cấp bậc tăng, Kinh nghiệm tăng -> Lương BẮT BUỘC TĂNG
    monotone_constraints = {'level_score': 1, 'experience_years': 1, 'edu_score': 1}

    print("2. Đang huấn luyện mô hình XGBoost...")
    model = xgb.XGBRegressor(
        n_estimators=1000,
        learning_rate=0.03,        # Hạ tốc độ học
        max_depth=4,               # Cắt rễ nông để cấm học vẹt
        min_child_weight=5,        # Bắt buộc quy luật phải lặp lại 5 lần mới học
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=2.0,             # Tăng khiên L1 mạnh lên để khử nhiễu
        reg_lambda=5.0,            # Tăng khiên L2 mạnh lên để 2 đường ôm sát nhau
        monotone_constraints=monotone_constraints,
        enable_categorical=True,
        eval_metric='rmse',
        early_stopping_rounds=50
    )

    eval_set = [(X_train, y_train), (X_val, y_val)]
    model.fit(X_train, y_train, eval_set=eval_set, verbose=False)

    # ĐÁNH GIÁ
    y_pred_vnd = np.expm1(model.predict(X_val))
    y_val_vnd = np.expm1(y_val)
    mae = mean_absolute_error(y_val_vnd, y_pred_vnd)
    r2 = r2_score(y_val_vnd, y_pred_vnd)
    
    print("\n=== KẾT QUẢ ĐÁNH GIÁ ===")
    print(f"MAE: {mae:.2f} triệu VNĐ")
    print(f"R2 Score: {r2:.2f}")

    # XUẤT BIỂU ĐỒ
    print("\n3. Đang xuất biểu đồ...")
    results = model.evals_result()
    epochs = len(results['validation_0']['rmse'])
    x_axis = range(0, epochs)
    
    plt.figure(figsize=(10, 5))
    plt.plot(x_axis, results['validation_0']['rmse'], label='Train Loss (Log)')
    plt.plot(x_axis, results['validation_1']['rmse'], label='Validation Loss (Log)')
    plt.legend()
    plt.ylabel('RMSE Loss (Log VNĐ)')
    plt.xlabel('Epochs')
    plt.title('Đường cong học tập (Đã Fix Data)')
    
    plot_path = os.path.join(MODEL_DIR, 'loss_chart.png')
    plt.savefig(plot_path)
    print(f"-> Đã lưu biểu đồ tại '{plot_path}'")

    model_path = os.path.join(MODEL_DIR, 'salary_predictor.pkl')
    joblib.dump(model, model_path)
    print(f"-> Đã xuất mô hình. Xong!")

if __name__ == "__main__":
    train_pipeline()