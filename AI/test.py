import os
import pandas as pd
import numpy as np
import joblib
from model_manager import get_and_sync_model_dir

MODEL_DIR = get_and_sync_model_dir('salary')

# Bộ đệm lưu giữ model trên RAM đúng 1 lần duy nhất mãi mãi
_cached_models = {}

def load_model_and_predict(cv_data):
    global _cached_models
    
    if not _cached_models:
        model_path = os.path.join(MODEL_DIR, 'salary_predictor.pkl')
        mapping_path = os.path.join(MODEL_DIR, 'category_mapping.pkl')
        lvl_map_path = os.path.join(MODEL_DIR, 'level_mapping.pkl')
        edu_map_path = os.path.join(MODEL_DIR, 'edu_mapping.pkl')
        
        try:
            _cached_models['model'] = joblib.load(model_path)
            _cached_models['category_mapping'] = joblib.load(mapping_path)
            _cached_models['level_mapping'] = joblib.load(lvl_map_path)
            _cached_models['edu_mapping'] = joblib.load(edu_map_path)
        except FileNotFoundError:
            return {
                "avg_salary": 15.0, "min_salary": 12.0, "max_salary": 20.0,
                "range_suggested": "12.0 - 20.0 triệu VNĐ", "formatted": "15.0 triệu VNĐ / tháng",
                "error": "Chưa có model. Hãy chạy train.py trước!"
            }

    model = _cached_models['model']
    category_mapping = _cached_models['category_mapping']
    level_mapping = _cached_models['level_mapping']
    edu_mapping = _cached_models['edu_mapping']

    # CHUẨN HÓA DỮ LIỆU ĐẦU VÀO ĐỂ AI TỰ HIỂU
    experience_years = float(cv_data.get('experience_years', 0) or 0)
    market_demand = float(cv_data.get('market_demand', 0) or 0)
    
    # Tạo bản sao tránh sửa trực tiếp vào dict gốc
    data = dict(cv_data)
    data['experience_years'] = experience_years
    data['market_demand'] = market_demand
    data['exp_demand_power'] = experience_years * market_demand
    data['level_score'] = level_mapping.get(data.get('level'), 2)
    data['edu_score'] = edu_mapping.get(data.get('education'), 0)

    # Tạo DataFrame để ném vào Model
    df_cv = pd.DataFrame([data])
    
    # Chỉ định nghĩa categorical cho category và location
    for col, cats in category_mapping.items():
        if col in df_cv.columns:
            df_cv[col] = pd.Categorical(df_cv[col], categories=cats)

    # Đảm bảo thứ tự cột y hệt như lúc Train
    features = ['category', 'location', 'level_score', 'edu_score', 'experience_years', 'market_demand', 'exp_demand_power']
    df_cv = df_cv[features]

    # AI TỰ ĐỘNG DỰ ĐOÁN (KHÔNG HARDCODE IF-ELSE)
    predicted_salary_log = model.predict(df_cv)[0]
    predicted_salary_vnd = np.expm1(predicted_salary_log)
    
    # TẠO DẢI LƯƠNG ĐỘNG
    avg_salary = round(float(predicted_salary_vnd), 2)
    min_salary = round(avg_salary * 0.85, 2)
    max_salary = round(avg_salary * 1.15, 2)
    
    return {
        "avg_salary": avg_salary,
        "min_salary": min_salary,
        "max_salary": max_salary,
        "range_suggested": f"{min_salary} - {max_salary} triệu VNĐ",
        "formatted": f"{avg_salary} triệu VNĐ / tháng"
    }

if __name__ == "__main__":
    cv_quang_minh = {
        'category': 'IT - Phần mềm',
        'location': 'Đà Nẵng',
        'level': 'Thực tập sinh',
        'education': 'Đại Học trở lên',
        'experience_years': 0.25, 
        'market_demand': 5
    }
    
    cv_senior_xd = {
        'category': 'Xây dựng',
        'location': 'Hà Nội',
        'level': 'Trưởng/Phó phòng',
        'education': 'Đại Học trở lên',
        'experience_years': 5, 
        'market_demand': 93
    }

    res_1 = load_model_and_predict(cv_quang_minh)
    print(f"Hồ sơ: Quang Minh (Intern IT Đà Nẵng)")
    print(f"-> Lương trung bình dự đoán: {res_1.get('avg_salary')} triệu VNĐ")
    print(f"-> Dải lương tham khảo: {res_1.get('range_suggested')}")

    print("\n-------------------------------\n")

    res_2 = load_model_and_predict(cv_senior_xd)
    print(f"Hồ sơ: Senior Xây Dựng Hà Nội")
    print(f"-> Lương trung bình dự đoán: {res_2.get('avg_salary')} triệu VNĐ")
    print(f"-> Dải lương tham khảo: {res_2.get('range_suggested')}")
