import os
import pdfplumber
import google.generativeai as genai
import json
import re
import joblib
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL_DIR = 'models'

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash') 
else:
    print("⚠️ CẢNH BÁO: Chưa tìm thấy GEMINI_API_KEY trong file .env!")
    model = None

def get_all_valid_mappings():
    """Hàm chui vào thư mục models/ lấy TOÀN BỘ danh sách chuẩn để ép Gemini"""
    try:
        # 1. Lấy Category và Location
        cat_map = joblib.load(os.path.join(MODEL_DIR, 'category_mapping.pkl'))
        categories = cat_map.get('category', [])
        locations = cat_map.get('location', [])

        # 2. Lấy danh sách Level
        lvl_map = joblib.load(os.path.join(MODEL_DIR, 'level_mapping.pkl'))
        levels = list(lvl_map.keys())

        # 3. Lấy danh sách Education
        edu_map = joblib.load(os.path.join(MODEL_DIR, 'edu_mapping.pkl'))
        educations = list(edu_map.keys())

        return categories, locations, levels, educations
    except Exception as e:
        print(f"Lỗi khi đọc file trong models/: {e}")
        # Giá trị dự phòng nếu vô tình mất file
        return ["IT - Phần mềm"], ["Đà Nẵng"], ["Thực tập sinh", "Nhân viên"], ["Đại Học trở lên"]

def extract_text_from_pdf(pdf_path):
    """Hàm cào toàn bộ chữ từ file PDF"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Lỗi đọc file PDF: {e}")
        return None

def parse_cv_with_ai(raw_text):
    """Hàm dùng AI để đọc hiểu và xuất JSON"""
    if not model:
        print("Lỗi: Không có model AI vì thiếu API Key.")
        return None

    print("Đang nhờ AI phân tích dữ liệu CV và đối chiếu với Models...")
    
    # Kéo toàn bộ list chuẩn từ Model ra
    valid_categories, valid_locations, valid_levels, valid_educations = get_all_valid_mappings()
    
    system_prompt = f"""
    Bạn là một chuyên gia Nhân sự xuất sắc. Đọc nội dung CV và xuất ra file JSON.
    
    QUY TẮC BẮT BUỘC:
    1. 'experience_years': CHỈ TÍNH thời gian làm việc chính thức tại công ty. Tuyệt đối KHÔNG cộng thời gian làm đồ án môn học, dự án cá nhân hay ngoại khóa. Trả về 0 nếu chưa đi làm.
    
    2. 'category': BẮT BUỘC chọn ĐÚNG 1 giá trị từ danh sách: {valid_categories}. Suy luận nếu CV không ghi chính xác.
    
    3. 'location': BẮT BUỘC chọn ĐÚNG 1 giá trị từ danh sách: {valid_locations}.
    
    4. 'level': BẮT BUỘC chọn ĐÚNG 1 giá trị từ danh sách: {valid_levels}.
    
    5. 'education': BẮT BUỘC chọn ĐÚNG 1 giá trị từ danh sách: {valid_educations}.
    
    6. 'portfolio_skills': Liệt kê mảng các công nghệ/kỹ năng có trong CV.

    Định dạng JSON bắt buộc:
    {{
        "category": "...",
        "location": "...",
        "level": "...",
        "education": "...",
        "experience_years": 0.0,
        "portfolio_skills": ["...", "..."]
    }}
    Chỉ trả về JSON hợp lệ.
    """

    prompt = f"{system_prompt}\n\nNỘI DUNG CV:\n{raw_text}"

    try:
        response = model.generate_content(prompt)
        result_text = response.text
        
        result_text = re.sub(r'```json\n?', '', result_text)
        result_text = re.sub(r'```\n?', '', result_text).strip()
        
        parsed_data = json.loads(result_text)
        return parsed_data

    except Exception as e:
        print(f"AI không thể bóc tách hoặc JSON lỗi: {e}")
        print("Raw response:", response.text if response else "No response")
        return None

if __name__ == "__main__":
    cv_file = r"C:\Users\ADMIN\Downloads\-Nguyen-Quang-Minh-TopCV.vn-300326.80753.pdf"
    
    print(f"1. Đang đọc text từ file {cv_file}...")
    raw_cv_text = extract_text_from_pdf(cv_file)
    
    if raw_cv_text:
        print("-> Đọc PDF thành công! Độ dài:", len(raw_cv_text), "ký tự.")
        
        json_result = parse_cv_with_ai(raw_cv_text)
        
        if json_result:
            print("\n=== KẾT QUẢ AI BÓC TÁCH ĐƯỢC ===")
            print(json.dumps(json_result, indent=4, ensure_ascii=False))