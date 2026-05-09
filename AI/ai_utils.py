import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def get_gemini_keys():
    """Lấy toàn bộ API keys có trong .env (GEMINI_API_KEY, GEMINI_API_KEY_2, ...)"""
    keys = []
    # Thử lấy khóa mặc định trước
    primary_key = os.environ.get("GEMINI_API_KEY")
    if primary_key:
        keys.append(primary_key)
    
    # Thử lấy các khóa phụ (GEMINI_API_KEY_2, 3, ...)
    for i in range(2, 11):
        key = os.environ.get(f"GEMINI_API_KEY_{i}")
        if key:
            keys.append(key)
    return keys

# State toàn cục để theo dõi key đang dùng
GEMINI_KEYS = get_gemini_keys()
CURRENT_KEY_INDEX = 0

def generate_with_rotation(prompt, model_name="gemini-2.5-flash", system_instruction=None):
    """
    Hàm gọi Gemini với cơ chế tự động đổi Key khi hết Quota (429)
    """
    global CURRENT_KEY_INDEX
    
    if not GEMINI_KEYS:
        raise Exception("Không tìm thấy GEMINI_API_KEY nào trong file .env")

    # Thử lần lượt các key bắt đầu từ key hiện tại
    for _ in range(len(GEMINI_KEYS)):
        api_key = GEMINI_KEYS[CURRENT_KEY_INDEX]
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_str = str(e).lower()
            # Nếu lỗi 429 (Too Many Requests / Quota Exceeded) hoặc lỗi tương tự
            if "429" in error_str or "quota" in error_str or "limit" in error_str:
                print(f"⚠️ Key {CURRENT_KEY_INDEX + 1} hết hạn/quota. Đang chuyển sang key tiếp theo...")
                CURRENT_KEY_INDEX = (CURRENT_KEY_INDEX + 1) % len(GEMINI_KEYS)
            else:
                # Nếu là lỗi khác (như lỗi mạng, prompt vi phạm chính sách) thì raise lên luôn
                raise e
    
    raise Exception("Tất cả GEMINI API Keys đều đã hết Quota hoặc không khả dụng.")
