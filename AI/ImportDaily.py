import re
import pandas as pd
from sqlalchemy import create_engine, text
import numpy as np
import bcrypt
from dotenv import load_dotenv
import os

# Load environmental variables
load_dotenv()

# --- Configuration from .env ---
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "job_recruitment")

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4")

def normalize_list_field(value):
    if not isinstance(value, str):
        return []
    
    # Dọn dẹp các cụm "và X nơi khác" hoặc "chi nhánh khác"
    value = re.sub(r"và\s+\d+\s+nơi\s+khác.*", "", value, flags=re.IGNORECASE)
    value = re.sub(r"và\s+\d+\s+chi\s+nhánh\s+khác.*", "", value, flags=re.IGNORECASE)
    
    # Split by common delimiters
    parts = re.split(r"[;,|\n/]+", value)
    out = []
    for p in parts:
        clean = p.strip()
        # Loại bỏ các từ thừa phổ biến
        clean = re.sub(r"^(Địa điểm|Nơi làm việc|Khu vực)\s*:\s*", "", clean, flags=re.IGNORECASE)
        if clean and len(clean) < 50: # Tên tỉnh thành thường ngắn
            out.append(clean)
    return list(dict.fromkeys(out))

def split_job_content(raw: str):
    """
    Robust splitting of job content into specific sections.
    """
    r = {"description": "", "requirement": "", "benefit": "", "workTime": "", "workLocation": ""}
    if not isinstance(raw, str) or not raw.strip():
        return r
    
    raw = raw.strip().replace("\r", "")

    # Markers for splitting
    markers = [
        ("description", r"(MÔ TẢ CÔNG VIỆC|MÔ TẢ:)"),
        ("requirement", r"(YÊU CẦU ỨNG VIÊN|YÊU CẦU CÔNG VIỆC|YÊU CẦU:)"),
        ("benefit", r"(QUYỀN LỢI|PHÚC LỢI|LỢI ÍCH|BENEFITS?:?)"),
        ("workLocation", r"(ĐỊA ĐIỂM LÀM VIỆC|NƠI LÀM VIỆC|ĐỊA ĐIỂM:)"),
        ("workTime", r"(THỜI GIAN LÀM VIỆC|GIỜ LÀM VIỆC|THỜI GIAN:)"),
        ("stop", r"(CÁCH THỨC ỨNG TUYỂN|ỨNG TUYỂN|THÔNG TIN KHÁC)")
    ]

    # Combine all patterns into one for splitting
    all_patterns = "|".join([p[1] for p in markers])
    split_pattern = re.compile(all_patterns, re.IGNORECASE)
    
    parts = split_pattern.split(raw)
    # The split result alternates between content and the matched markers
    # However, re.split with capture groups returns the matched groups too
    
    # Let's use a more controlled approach: find all markers and their positions
    matches = list(split_pattern.finditer(raw))
    
    if not matches:
        r["description"] = raw
        return r

    current_section = "description" # Default if text starts before any marker
    
    last_end = 0
    for match in matches:
        # Text before this marker belongs to current_section
        content = raw[last_end:match.start()].strip()
        if content:
            if current_section and current_section != "stop":
                r[current_section] += (" " if r[current_section] else "") + content
        
        # Determine next section
        marker_text = match.group(0).upper()
        for key, pattern in markers:
            if re.search(pattern, marker_text, re.IGNORECASE):
                current_section = key
                break
        
        last_end = match.end()

    # Final piece
    if current_section and current_section != "stop":
        content = raw[last_end:].strip()
        if content:
            r[current_section] += (" " if r[current_section] else "") + content

    # Post-process: clean up colons, dashes at start, and extra whitespace
    for k in r:
        val = r[k].strip()
        # Remove leading colons or junk
        val = re.sub(r'^[:\-\s\.]+', '', val)
        r[k] = val

    return r

def upsert_company(name, logo, intro, website, address, scale):
    if not name:
        return None
    with engine.begin() as conn:
        # Check by name
        sql_check = text("SELECT id FROM companies WHERE name = :name LIMIT 1")
        existing = conn.execute(sql_check, {"name": name}).fetchone()
        
        if existing:
            # Update existing company with new info if available
            sql_update = text("""
                UPDATE companies 
                SET logo = COALESCE(NULLIF(:logo, ''), logo),
                    description = COALESCE(NULLIF(:intro, ''), description),
                    website_url = COALESCE(NULLIF(:website, ''), website_url),
                    company_address = COALESCE(NULLIF(:address, ''), company_address),
                    company_scale = COALESCE(NULLIF(:scale, ''), company_scale)
                WHERE id = :id
            """)
            conn.execute(sql_update, {
                "id": existing[0],
                "logo": logo,
                "intro": intro,
                "website": website,
                "address": address,
                "scale": scale
            })
            return existing[0]
        
        # Insert new
        sql_insert = text("""
            INSERT INTO companies (name, logo, description, website_url, company_address, company_scale, created_at, updated_at)
            VALUES (:name, :logo, :intro, :website, :address, :scale, NOW(), NOW())
        """)
        result = conn.execute(sql_insert, {
            "name": name,
            "logo": logo,
            "intro": intro,
            "website": website,
            "address": address,
            "scale": scale
        })
        co_id = result.lastrowid
        # Create default recruiter account
        create_recruiter_account(conn, co_id, name)
        return co_id

def upsert_item(table, name_col, value):
    if not value:
        return None
    with engine.begin() as conn:
        sql_check = text(f"SELECT id FROM {table} WHERE {name_col} = :val LIMIT 1")
        existing = conn.execute(sql_check, {"val": value}).fetchone()
        if existing:
            return existing[0]
        
        sql_insert = text(f"INSERT INTO {table} ({name_col}, created_at, updated_at) VALUES (:val, NOW(), NOW())")
        result = conn.execute(sql_insert, {"val": value})
        return result.lastrowid

def link_relation(job_id, table, job_id_col, other_id_col, other_id):
    if not other_id:
        return
    with engine.begin() as conn:
        sql_check = text(f"SELECT 1 FROM {table} WHERE {job_id_col} = :jid AND {other_id_col} = :oid LIMIT 1")
        if conn.execute(sql_check, {"jid": job_id, "oid": other_id}).fetchone():
            return
        
        sql_insert = text(f"INSERT INTO {table} ({job_id_col}, {other_id_col}) VALUES (:jid, :oid)")
        conn.execute(sql_insert, {"jid": job_id, "oid": other_id})

def create_recruiter_account(conn, company_id, company_name):
    """Creates a default employer account for the company if it doesn't exist."""
    email = f"hr.{company_id}@pbl7.com"
    # Check if user already exists
    exists = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email}).fetchone()
    if exists:
        return
    
    password = "12345678"
    # Hash password (bcrypt rounds=10)
    # Note: bcrypt.hashpw returns bytes, we decode to string for MySQL
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
    # Match Node.js bcryptjs format (replace $2b$ with $2a$ if needed, but usually compatible)
    # Node's bcryptjs often uses $2a$. Python's bcrypt uses $2b$. 
    # Most libraries accept both.
    
    sql_user = text("""
        INSERT INTO users (email, password, company_id, name, role, created_at, updated_at)
        VALUES (:email, :pass, :cid, :name, 'EMPLOYER', NOW(), NOW())
    """)
    conn.execute(sql_user, {
        "email": email,
        "pass": hashed,
        "cid": company_id,
        "name": f"HR - {company_name}"
    })
    print(f"   [User Created] Email: {email} | Pass: 12345678")

def parse_quantity(value):
    if pd.isna(value) or not str(value).strip():
        return None
    m = re.search(r"\d+", str(value))
    return int(m.group()) if m else None

def main(csv_path):
    print(f"Reading CSV: {csv_path}")
    df = pd.read_csv(csv_path).replace({np.nan: None})
    
    total = len(df)
    inserted = 0
    skipped = 0
    
    for idx, row in df.iterrows():
        job_url = row.get("job_url")
        job_title = row.get("job_title")
        company_name = row.get("company_name")
        
        if not job_title or not company_name:
            print(f"[SKIP][{idx}] Missing title or company name.")
            skipped += 1
            continue

        # 1. Deduplication by job_url
        with engine.connect() as conn:
            check_sql = text("SELECT id FROM jobs WHERE job_url = :url LIMIT 1")
            existing_job = conn.execute(check_sql, {"url": job_url}).fetchone()
            if existing_job:
                # print(f"[SKIP][{idx}] Job already exists: {job_title}")
                skipped += 1
                continue

        # 2. Upsert Company
        company_id = upsert_company(
            name=company_name,
            logo=row.get("company_logo"),
            intro=row.get("company_intro"),
            website=row.get("company_website"),
            address=row.get("company_address"),
            scale=row.get("company_scale")
        )

        # 3. Parse content
        raw_content = row.get("chi_tiet_cong_viec", "")
        parsed = split_job_content(raw_content)
        
        # 4. Insert Job
        with engine.begin() as conn:
            sql_job = text("""
                INSERT INTO jobs 
                (company_id, title, salary, level, experience, education, gender, quantity, 
                 employment_type, description, requirement, benefit, work_location, work_time, 
                 job_url, start_date, status, created_at, updated_at)
                VALUES 
                (:cid, :title, :salary, :level, :exp, :edu, :gender, :qty, 
                 :etype, :desc, :req, :ben, :wloc, :wtime, 
                 :url, :start, 'open', NOW(), NOW())
            """)
            
            res = conn.execute(sql_job, {
                "cid": company_id,
                "title": job_title,
                "salary": row.get("muc_luong"),
                "level": row.get("cap_bac"),
                "exp": row.get("kinh_nghiem"),
                "edu": row.get("hoc_van"),
                "gender": row.get("gioi_tinh"),
                "qty": parse_quantity(row.get("so_luong")),
                "etype": row.get("hinh_thuc"),
                "desc": parsed["description"],
                "req": parsed["requirement"],
                "ben": parsed["benefit"],
                "wloc": parsed["workLocation"] if parsed["workLocation"] else row.get("location"),
                "wtime": parsed["workTime"],
                "url": job_url,
                "start": row.get("crawl_date")
            })
            job_id = res.lastrowid

        # 5. Handle Categories
        cats = normalize_list_field(row.get("category"))
        for cat in cats:
            cat_id = upsert_item("categories", "name", cat)
            link_relation(job_id, "job_categories", "job_id", "category_id", cat_id)

        # 6. Handle Locations
        locs = normalize_list_field(row.get("location"))
        for loc in locs:
            loc_id = upsert_item("locations", "name", loc)
            link_relation(job_id, "job_locations", "job_id", "location_id", loc_id)

        inserted += 1
        if inserted % 20 == 0:
            print(f"Processed {idx+1}/{total} rows... (Inserted: {inserted}, Skipped: {skipped})")

    print(f"\nFinished! Total: {total}, Inserted: {inserted}, Skipped: {skipped}")

def run_import(csv_file):
    main(csv_file)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python ImportDaily.py <path_to_csv>")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    run_import(csv_file)
