import os
import json
from flask import Flask, render_template, request, redirect, url_for, flash
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv 

load_dotenv() 

import google.generativeai as genai
from readCV import extract_text_from_pdf, parse_cv_with_ai
from test import load_model_and_predict

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

API_BASE = os.environ.get("BACKEND_API_BASE")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

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
        if GEMINI_API_KEY:
            try:
                genai.configure(api_key=GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-2.5-flash")
                prompt = (
                    "Bạn là một chuyên gia nhân sự. Dựa trên báo cáo thị trường và CV dưới đây, hãy đưa ra lời khuyên nghề nghiệp ngắn gọn. "
                    f"CV: {json.dumps(cv_data, ensure_ascii=False)}. "
                    f"Market Info: {json.dumps(market_info, ensure_ascii=False)}. "
                    f"Dự đoán lương: {salary_result}."
                )
                adv_response = model.generate_content(prompt)
                career_advice = adv_response.text.strip()
            except Exception as e:
                career_advice = f"Không thể tạo lời khuyên tự động: {e}"
        else:
            career_advice = "Thiếu GEMINI_API_KEY, không tạo được lời khuyên tự động."

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)