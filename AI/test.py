import os
import sys
if sys.stdout.encoding != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except: pass
import joblib
import pandas as pd
import numpy as np
from model_manager import get_and_sync_model_dir

MODEL_SALARY_DIR = get_and_sync_model_dir('salary')

# Cache model và mapping để tránh đọc đĩa nhiều lần
_salary_model = None
_cat_mapping = None
_level_mapping = None
_edu_mapping = None

def _load_artifacts():
    global _salary_model, _cat_mapping, _level_mapping, _edu_mapping
    if _salary_model is None:
        model_path = os.path.join(MODEL_SALARY_DIR, 'salary_predictor.pkl')
        cat_map_path = os.path.join(MODEL_SALARY_DIR, 'category_mapping.pkl')
        level_map_path = os.path.join(MODEL_SALARY_DIR, 'level_mapping.pkl')
        edu_map_path = os.path.join(MODEL_SALARY_DIR, 'edu_mapping.pkl')
        
        if not os.path.exists(model_path):
            raise Exception("Không tìm thấy file mô hình dự đoán lương (salary_predictor.pkl).")
            
        _salary_model = joblib.load(model_path)
        _cat_mapping = joblib.load(cat_map_path) if os.path.exists(cat_map_path) else {}
        _level_mapping = joblib.load(level_map_path) if os.path.exists(level_map_path) else {
            'Thực tập sinh': 1, 'Nhân viên': 2, 'Trưởng nhóm': 3,
            'Quản lý / Giám sát': 4, 'Trưởng/Phó phòng': 5,
            'Phó giám đốc': 6, 'Giám đốc': 7
        }
        _edu_mapping = joblib.load(edu_map_path) if os.path.exists(edu_map_path) else {
            'Không yêu cầu': 0, 'Trung học cơ sở (Cấp 2) trở lên': 1,
            'Trung học phổ thông (Cấp 3) trở lên': 2, 'Trung cấp trở lên': 3,
            'Cao Đẳng trở lên': 4, 'Đại Học trở lên': 5
        }

def load_model_and_predict(input_data):
    """
    Hàm nhận input_data (dict) từ CV và trả về chuỗi dự đoán mức lương.
    input_data = {
        'category': 'IT - Phần mềm',
        'location': 'Hà Nội',
        'level': 'Nhân viên',
        'education': 'Đại Học trở lên',
        'experience_years': 2,
        'market_demand': 15.5
    }
    """
    try:
        _load_artifacts()
        
        cat = input_data.get('category') or 'Khác'
        loc = input_data.get('location') or 'Hà Nội'
        level_str = input_data.get('level') or 'Nhân viên'
        edu_str = input_data.get('education') or 'Đại Học trở lên'
        exp = float(input_data.get('experience_years') or 0.0)
        demand = float(input_data.get('market_demand') or 0.0)
        
        level_score = _level_mapping.get(level_str, 2)
        edu_score = _edu_mapping.get(edu_str, 5)
        exp_demand_power = exp * demand
        
        df_input = pd.DataFrame([{
            'category': cat,
            'location': loc,
            'level_score': level_score,
            'edu_score': edu_score,
            'experience_years': exp,
            'market_demand': demand,
            'exp_demand_power': exp_demand_power
        }])
        
        # Set categorical types
        for col in ['category', 'location']:
            cats = _cat_mapping.get(col, [df_input[col].iloc[0]])
            if df_input[col].iloc[0] not in cats:
                cats.append(df_input[col].iloc[0])
            df_input[col] = pd.Categorical(df_input[col], categories=cats)
            
        pred_log = _salary_model.predict(df_input)
        pred_vnd = np.expm1(pred_log)[0]
        
        # Giới hạn mức lương hợp lý để tránh số âm hoặc quá thấp
        if pred_vnd < 3.0:
            pred_vnd = 3.5
            
        return f"{pred_vnd:.1f} triệu VNĐ / tháng"
    except Exception as e:
        print(f"⚠️ Lỗi khi dự đoán lương: {e}")
        return "15.0 triệu VNĐ / tháng (Ước tính trung bình)"

if __name__ == "__main__":
    # Test nhanh khi chạy trực tiếp file
    sample = {
        'category': 'IT - Phần mềm',
        'location': 'Hà Nội',
        'level': 'Nhân viên',
        'education': 'Đại Học trở lên',
        'experience_years': 3,
        'market_demand': 25.0
    }
    print("Dự đoán mẫu:", load_model_and_predict(sample))
