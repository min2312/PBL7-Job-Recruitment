import re
import pandas as pd
from sqlalchemy import create_engine, text

# --- 1. Cấu hình DB ---
DB_USER = "root"
DB_PASS = ""            # nếu có password thì để vào đây
DB_HOST = "127.0.0.1"
DB_PORT = "3306"
DB_NAME = "job_recruitment"

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4")

def normalize_list_field(value: str):
    if not isinstance(value, str):
        return []
    parts = re.split(r"[;,|\n]+", value)
    out = []
    for p in parts:
        clean = p.strip()
        if clean:
            out.append(clean)
    return list(dict.fromkeys(out))  # remove duplicate, giữ order

def split_job_content(raw: str):
    r = {"description": "", "requirement": "", "benefit": "", "workTime": "", "workLocation": ""}
    if not isinstance(raw, str) or not raw.strip():
        return r
    raw = raw.strip().replace("\r", "")

    # Thẻ/tiêu đề thừa
    markers = [
        ("description", r"(MÔ TẢ CÔNG VIỆC|MÔ TẢ:)"),
        ("requirement", r"(YÊU CẦU ỨNG VIÊN|YÊU CẦU|YÊU CẦU CÔNG VIỆC:)"),
        ("benefit", r"(QUYỀN LỢI|PHÚC LỢI|LỢI ÍCH|BENEFIT)"),
        ("workTime", r"(THỜI GIAN LÀM VIỆC|GIỜ LÀM VIỆC|WORK TIME)"),
        ("workLocation", r"(ĐỊA ĐIỂM LÀM VIỆC|NƠI LÀM VIỆC|WORK LOCATION)"),
    ]

    split_pattern = re.compile(r"(MÔ TẢ CÔNG VIỆC|MÔ TẢ:|YÊU CẦU ỨNG VIÊN|YÊU CẦU|QUYỀN LỢI|PHÚC LỢI|THỜI GIAN LÀM VIỆC|ĐỊA ĐIỂM LÀM VIỆC|CÁCH THỨC ỨNG TUYỂN|WORK TIM|WORK LOCATION)", re.IGNORECASE)
    tokens = split_pattern.split(raw)
    toks = [t.strip() for t in tokens if t.strip() != ""]
    current = "description"
    for t in toks:
        header = t.strip().upper()
        if header in ("MÔ TẢ CÔNG VIỆC", "MÔ TẢ:", "MÔ TẢ"):
            current = "description"; continue
        if header in ("YÊU CẦU ỨNG VIÊN", "YÊU CẦU", "YÊU CẦU CÔNG VIỆC"):
            current = "requirement"; continue
        if header in ("QUYỀN LỢI", "PHÚC LỢI", "BENEFIT"):
            current = "benefit"; continue
        if header in ("THỜI GIAN LÀM VIỆC", "GIỜ LÀM VIỆC", "WORK TIME"):
            current = "workTime"; continue
        if header in ("ĐỊA ĐIỂM LÀM VIỆC", "NƠI LÀM VIỆC", "WORK LOCATION"):
            current = "workLocation"; continue
        if header in ("CÁCH THỨC ỨNG TUYỂN","ỨNG TUYỂN","CÁCH THỨC"):
            break
        r[current] += (t + "\n\n")
    for k in r:
        r[k] = r[k].strip()
        r[k] = re.sub(r'^[:\s]+', '', r[k])
    return r

def upsert_one(table, key_col, key_val, col_values):
    if not key_val:
        return None
    with engine.begin() as conn:
        sql_check = text(f"SELECT id FROM {table} WHERE {key_col}= :val LIMIT 1")
        existing = conn.execute(sql_check, {"val": key_val}).fetchone()
        if existing:
            return existing[0]
        cols = ", ".join([key_col] + list(col_values.keys()))
        vals = ", ".join([":key"] + [f":{k}" for k in col_values.keys()])
        payload = {"key": key_val}
        payload.update(col_values)
        insert_sql = text(f"INSERT INTO {table} ({cols}) VALUES ({vals})")
        result = conn.execute(insert_sql, payload)
        return result.lastrowid

def insert_job_relation(job_id, table, id_col, other_col, other_id):
    if other_id is None:
        return
    with engine.begin() as conn:
        exists = conn.execute(
            text(f"SELECT 1 FROM {table} WHERE {id_col}= :jid AND {other_col}= :oid LIMIT 1"),
            {"jid": job_id, "oid": other_id},
        ).fetchone()
        if exists:
            return
        conn.execute(
            text(f"INSERT INTO {table} ({id_col},{other_col}) VALUES (:jid,:oid)"),
            {"jid": job_id, "oid": other_id},
        )

def parse_quantity(value):
    if value is None:
        return None
    value = str(value).strip()
    if not value:
        return None
    m = re.search(r"\d+", value)
    return int(m.group()) if m else None

def main(csv_path):
    df = pd.read_csv(csv_path, dtype=str).fillna("")
    inserted = 0

    for idx, row in df.iterrows():
        company_name = row.get("company_name", "").strip()
        company_logo = row.get("company_logo", "").strip()

        if not company_name:
            print(f"[SKIP][{idx}] Không có company_name.")
            continue

        company_id = upsert_one(
            "companies",
            "name",
            company_name,
            {"logo": company_logo}
        )

        levels = row.get("cap_bac", "").strip()
        exp = row.get("kinh_nghiem", "").strip()
        education = row.get("hoc_van", "").strip()
        quantity = parse_quantity(row.get("so_luong", "").strip())
        employ = row.get("hinh_thuc", "").strip()
        gender = row.get("gioi_tinh", "").strip()
        salary = row.get("muc_luong", "").strip()
        title = row.get("job_title", "").strip()
        raw_content = row.get("chi_tiet_cong_viec", "").strip()
        category_field = row.get("category", "").strip()
        location_field = row.get("location", "").strip()

        parsed = split_job_content(raw_content)

        with engine.begin() as conn:
            sql_job = text("""
                INSERT INTO jobs
                (company_id, title, salary, level, experience, education, gender, quantity,
                 employment_type, description, requirement, benefit, work_location, work_time)
                VALUES
                (:company_id, :title, :salary, :level, :experience, :education, :gender, :quantity,
                  :employment_type, :description, :requirement, :benefit, :work_location, :work_time)
            """)
            res = conn.execute(sql_job, {
                "company_id": company_id,
                "title": title,
                "salary": salary or None,
                "level": levels or None,
                "experience": exp or None,
                "education": education or None,
                "gender": gender or None,
                "quantity": quantity,
                "employment_type": employ or None,
                "description": parsed["description"] or None,
                "requirement": parsed["requirement"] or None,
                "benefit": parsed["benefit"] or None,
                "work_location": location_field or None,  # <-- CHỈ LẤY TỪ CỘT LOCATION CỦA CSV
                "work_time": parsed["workTime"] or None,
            })
            job_id = res.lastrowid

        # categories
        for cat in normalize_list_field(category_field):
            category_id = upsert_one("categories", "name", cat, {})
            insert_job_relation(job_id, "job_categories", "job_id", "category_id", category_id)

        # locations
        xloc_list = normalize_list_field(location_field) # <-- BỎ LOGIC DỰ PHÒNG LẤY TỪ MÔ TẢ
        for loc in xloc_list:
            location_id = upsert_one("locations", "name", loc, {})
            insert_job_relation(job_id, "job_locations", "job_id", "location_id", location_id)

        inserted += 1
        if inserted % 50 == 0:
            print(f"Inserted {inserted} jobs...")

    print(f"Hoàn thành. Đã insert {inserted} job(s).")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python import_jobs.py path/to/topcv_jobs_full_filtered.csv")
        sys.exit(1)
    main(sys.argv[1])