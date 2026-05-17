import os
import json
from flask import Flask, render_template, request, redirect, url_for, flash
import requests
from werkzeug.utils import secure_filename
from flask_cors import CORS
from dotenv import load_dotenv 

load_dotenv() 

import sys
if sys.platform != "win32" and os.path.exists('/home'):
    os.environ["HF_HOME"] = "/home/ai_models/hf_cache"

import google.generativeai as genai
from readCV import extract_text_from_pdf, parse_cv_with_ai
from test import load_model_and_predict
from ai_utils import generate_with_rotation

# Imports cho Gợi ý việc làm
import joblib
from sentence_transformers import SentenceTransformer
import faiss

from model_manager import get_and_sync_model_dir

MODEL_REC_DIR = get_and_sync_model_dir('recommendation')
model_st = None # Load lazy
rec_artifacts = {} # Cache cho df, index, clf, vectorizer

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
app.secret_key = os.environ.get("FLASK_SECRET_KEY")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

API_BASE = os.environ.get("BACKEND_API_BASE")

def preload_weights():
    """Hàm load toàn bộ model/artifact vào bộ nhớ RAM"""
    global model_st, rec_artifacts
    print("🚀 Đang khởi động AI Server: Preloading weights & models...")
    try:
        # 1. Load model ST
        if model_st is None:
            model_st = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            print("  - SentenceTransformer: Loaded")

        # 2. Load artifacts cho Recommendation
        if not rec_artifacts:
            rec_artifacts['df'] = joblib.load(os.path.join(MODEL_REC_DIR, 'df.pkl'))
            rec_artifacts['index'] = faiss.read_index(os.path.join(MODEL_REC_DIR, 'faiss.index'))
            rec_artifacts['clf'] = joblib.load(os.path.join(MODEL_REC_DIR, 'clf.pkl'))
            rec_artifacts['vectorizer'] = joblib.load(os.path.join(MODEL_REC_DIR, 'vectorizer_cls.pkl'))
            print("  - Recommendation Artifacts: Loaded")
        
        print("✅ Preload hoàn tất!")
    except Exception as e:
        print(f"❌ Lỗi khi preload: {e}")

# Khởi chạy nạp toàn bộ trọng số (weights) ngay khi khởi động App (đúng 1 lần duy nhất)
# Điều kiện này đảm bảo: Khi chạy py .\app.py ở local, chỉ nạp ở tiến trình con (WERKZEUG_RUN_MAIN), bỏ qua tiến trình stat reloader. Khi chạy trên Gunicorn Azure, tự động nạp.
if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not sys.argv[0].endswith("app.py"):
    preload_weights()
    from test import _cached_models, MODEL_DIR
    try:
        if not _cached_models:
            _cached_models['model'] = joblib.load(os.path.join(MODEL_DIR, 'salary_predictor.pkl'))
            _cached_models['category_mapping'] = joblib.load(os.path.join(MODEL_DIR, 'category_mapping.pkl'))
            _cached_models['level_mapping'] = joblib.load(os.path.join(MODEL_DIR, 'level_mapping.pkl'))
            _cached_models['edu_mapping'] = joblib.load(os.path.join(MODEL_DIR, 'edu_mapping.pkl'))
            print("  - Salary Predictor: Loaded")
    except Exception as e:
        print(f"  - Salary Predictor error: {e}")

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if "file" not in request.files:
            flash("Vui lòng chọn file PDF.")
            return redirect(request.url)
        file = request.files["file"]
        if file.filename == "":
            flash("Vui lòng chọn file PDF.")
            return redirect(request.url)
        if not allowed_file(file.filename):
            flash("Chỉ chấp nhận file PDF.")
            return redirect(request.url)

        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        raw_text = extract_text_from_pdf(file_path)
        if not raw_text:
            flash("Không đọc được nội dung PDF. Vui lòng thử lại với file khác.")
            return redirect(request.url)

        cv_data = parse_cv_with_ai(raw_text)
        if not cv_data:
            flash("AI không thể parse CV. Vui lòng thử lại.")
            return redirect(request.url)

        category = cv_data.get("category")
        location = cv_data.get("location")

        market_info = None
        if category and location:
            try:
                r = requests.get(
                    f"{API_BASE}/market-demand",
                    params={"category": category, "location": location, "days": 30},
                    timeout=10,
                )
                if r.ok:
                    market_info = r.json().get("data")
                else:
                    market_info = {"error": f"Không lấy được market demand (status {r.status_code})"}
            except Exception as e:
                market_info = {"error": str(e)}
        else:
            market_info = {"error": "Thiếu category hoặc location từ CV"}

        # Dự đoán lương bằng model
        salary_result = load_model_and_predict({
            "category": category,
            "location": location,
            "level": cv_data.get("level"),
            "education": cv_data.get("education"),
            "experience_years": cv_data.get("experience_years", 0),
            "market_demand": float((market_info.get("market_demand") if isinstance(market_info, dict) else 0) or 0),
        })

        # Tạo lời khuyên
        career_advice = None
        try:
            prompt = (
                "Bạn là một chuyên gia nhân sự. Dựa trên báo cáo thị trường và CV dưới đây, hãy đưa ra lời khuyên nghề nghiệp ngắn gọn. "
                f"CV: {json.dumps(cv_data, ensure_ascii=False)}. "
                f"Market Info: {json.dumps(market_info, ensure_ascii=False)}. "
                f"Dự đoán lương: {salary_result}."
            )
            career_advice = generate_with_rotation(prompt, model_name="gemini-2.5-flash")
        except Exception as e:
            career_advice = f"Không thể tạo lời khuyên tự động: {e}"

        # GIẢI PHÁP SỬA LỖI Ở ĐÂY: Format tiếng Việt sẵn từ Python
        cv_data_formatted = json.dumps(cv_data, indent=4, ensure_ascii=False) if cv_data else ""
        market_info_formatted = json.dumps(market_info, indent=4, ensure_ascii=False) if market_info else ""

        return render_template(
            "result.html",
            cv_data_str=cv_data_formatted,            # Đã format sẵn
            market_info_str=market_info_formatted,    # Đã format sẵn
            salary_result=salary_result,
            career_advice=career_advice,
        )

    return render_template("upload.html")

@app.route("/api/predict-salary", methods=["POST"])
def predict_salary_api():
    """
    API dự đoán lương từ CV URL
    Body: { "cv_url": "https://..." }
    """
    data = request.get_json()
    cv_url = data.get("cv_url")

    if not cv_url:
        return {"errCode": 1, "errMessage": "Missing cv_url"}, 400

    try:
        # 1. Tải file từ URL
        response = requests.get(cv_url, timeout=15)
        if not response.ok:
            return {"errCode": 2, "errMessage": f"Cannot download CV from URL (status {response.status_code})"}, 400
        
        # Lưu tạm vào file để readCV xử lý (hoặc dùng BytesIO nếu readCV hỗ trợ)
        temp_filename = secure_filename(cv_url.split("/")[-1])
        if not temp_filename.endswith(".pdf"):
            temp_filename += ".pdf"
            
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], f"temp_{temp_filename}")
        
        with open(file_path, "wb") as f:
            f.write(response.content)

        # 2. Extract text & Parse CV
        raw_text = extract_text_from_pdf(file_path)
        if not raw_text:
            return {"errCode": 3, "errMessage": "Cannot extract text from PDF"}, 400

        cv_data = parse_cv_with_ai(raw_text)
        if not cv_data:
            return {"errCode": 4, "errMessage": "AI cannot parse CV content"}, 400

        # 3. Lấy Market Demand
        category = cv_data.get("category")
        location = cv_data.get("location")
        market_info = {"market_demand": 0}
        
        if category and location:
            try:
                r = requests.get(
                    f"{API_BASE}/market-demand",
                    params={"category": category, "location": location, "days": 30},
                    timeout=5,
                )
                if r.ok:
                    market_info = r.json().get("data") or {"market_demand": 0}
            except:
                pass

        # 4. Dự đoán lương
        salary_result = load_model_and_predict({
            "category": category,
            "location": location,
            "level": cv_data.get("level"),
            "education": cv_data.get("education"),
            "experience_years": cv_data.get("experience_years", 0),
            "market_demand": float(market_info.get("market_demand") or 0),
        })

        # 5. Tạo lời khuyên từ Gemini
        career_advice = "Thiếu cấu hình AI để tạo lời khuyên."
        try:
            prompt = (
                "Bạn là một chuyên gia nhân sự. Dựa trên báo cáo thị trường và CV dưới đây, hãy đưa ra lời khuyên nghề nghiệp ngắn gọn, súc tích bằng tiếng Việt. "
                f"CV: {json.dumps(cv_data, ensure_ascii=False)}. "
                f"Market Info: {json.dumps(market_info, ensure_ascii=False)}. "
                f"Dự đoán lương: {salary_result}."
            )
            career_advice = generate_with_rotation(prompt, model_name="gemini-2.5-flash")
        except Exception as e:
            career_advice = f"Không thể tạo lời khuyên: {str(e)}"

        # Xóa file tạm
        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "errCode": 0,
            "data": {
                "cv_data": cv_data,
                "market_info": market_info,
                "salary_prediction": salary_result,
                "career_advice": career_advice
            }
        }

    except Exception as e:
        return {"errCode": -1, "errMessage": str(e)}, 500

@app.route("/api/recommend", methods=["GET"])
def recommend_api():
    global model_st, rec_artifacts
    query = request.args.get("q", "")
    limit = int(request.args.get("limit", 10))
    exclude_id = request.args.get("exclude_id", "") # Nhận ID để loại bỏ
    
    if not query:
        return {"errCode": 1, "errMessage": "Missing query"}, 400

    try:
        # 1. Load model ST (Lazy load)
        if model_st is None:
            model_st = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

        # 2. Load artifacts (Lazy load & Cache) - Đã được preload ở startup nhưng vẫn giữ để an toàn
        if not rec_artifacts:
            preload_weights()

        df = rec_artifacts['df']
        index = rec_artifacts['index']
        clf = rec_artifacts['clf']
        vectorizer = rec_artifacts['vectorizer']

        # 3. Phân loại ngành
        q_cat_vec = vectorizer.transform([query])
        predicted_cat = clf.predict(q_cat_vec)[0]

        # 4. Tìm kiếm ngữ nghĩa
        q_emb = model_st.encode([query])
        D, I = index.search(q_emb.astype('float32'), limit + 5) # Lấy dư để trừ đi cái bị lọc

        # 5. Format kết quả & Loại bỏ exclude_id
        results = []
        for i in range(len(I[0])):
            idx = I[0][i]
            if idx < len(df):
                job = df.iloc[idx]
                job_id = str(job['id'])
                
                # Nếu ID trùng với exclude_id thì bỏ qua
                if job_id == exclude_id:
                    continue
                    
                results.append({
                    "id": job_id,
                    "job_title": job['job_title'],
                    "category": job['category'],
                    "location": job['location'],
                    "score": float(D[0][i])
                })
        
        return {
            "errCode": 0, 
            "data": results[:limit],
            "predicted_category": predicted_cat
        }
    except Exception as e:
        return {"errCode": -1, "errMessage": str(e)}, 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)