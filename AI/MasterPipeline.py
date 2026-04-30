import os
import sys
import subprocess
import requests
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environmental variables
load_dotenv()

# --- Cấu hình từ .env ---
BASE_DIR = r"d:\PBL7\AI"
VENV_PYTHON = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")
BACKEND_SYNC_URL = f"{os.getenv('BACKEND_URL', 'http://localhost:8081')}/api/neo4j/sync-new"

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def run_step(name, command):
    log(f"Đang chạy: {name}...")
    try:
        # Chạy command và in output trực tiếp để theo dõi
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
        for line in process.stdout:
            print(f"  > {line.strip()}")
        process.wait()
        
        if process.returncode == 0:
            log(f"Hoàn thành: {name}")
            return True
        else:
            log(f"LỖI: {name} kết thúc với mã lỗi {process.returncode}")
            return False
    except Exception as e:
        log(f"LỖI hệ thống khi chạy {name}: {str(e)}")
        return False

def sync_neo4j(retries=3):
    log("Đang gọi API đồng bộ dữ liệu sang Neo4j...")
    for i in range(retries):
        try:
            # timeout=None: Đợi cho đến khi xong thì thôi, không bao giờ tự ngắt
            response = requests.post(BACKEND_SYNC_URL, timeout=None) 
            if response.status_code == 200:
                log("Đồng bộ Neo4j thành công!")
                return True
            else:
                log(f"Đồng bộ Neo4j thất bại lần {i+1} (Status: {response.status_code})")
                print(f"  > Response: {response.text}")
        except Exception as e:
            log(f"Lỗi kết nối API Neo4j lần {i+1}: {str(e)}")
        
        if i < retries - 1:
            wait_time = (i + 1) * 10
            log(f"Sẽ thử lại sau {wait_time} giây...")
            time.sleep(wait_time)
            
    return False

def main():
    log("=== KHỞI ĐỘNG PIPELINE TỰ ĐỘNG ===")
    start_time = time.time()

    # Tạo timestamp chung cho toàn bộ run này
    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    daily_csv = os.path.join(BASE_DIR, f"topcv_daily_{now_str}.csv")

    # Bước 1: Crawl dữ liệu mới
    log("BƯỚC 1: CRAWL DỮ LIỆU")
    # Chúng ta truyền daily_csv trực tiếp vào script crawl
    if not run_step("Cào dữ liệu mới", [VENV_PYTHON, os.path.join(BASE_DIR, "DailyCrawl.py"), daily_csv]):
        log("Dừng pipeline do lỗi crawl.")
        return

    # Bước 2: Import vào MySQL & Tạo Account NTD tự động
    log("BƯỚC 2: IMPORT DB & TẠO ACCOUNT NTD")
    if not run_step("Import MySQL", [VENV_PYTHON, os.path.join(BASE_DIR, "ImportDaily.py"), daily_csv]):
        log("Dừng pipeline do lỗi Import.")
        return

    # --- BƯỚC MỚI: DỌN DẸP FILE ---
    try:
        if os.path.exists(daily_csv):
            os.remove(daily_csv)
            log(f"Đã dọn dẹp file tạm: {os.path.basename(daily_csv)}")
    except Exception as e:
        log(f"Cảnh báo: Không thể xóa file tạm {daily_csv}: {e}")

    # Bước 3: Đồng bộ sang Graph DB (Phục vụ Training)
    log("BƯỚC 3: ĐỒNG BỘ NEO4J")
    if not sync_neo4j():
        log("Cảnh báo: Đồng bộ Neo4j lỗi. Vẫn tiếp tục Train với data hiện tại.")

    # Bước 4: Huấn luyện AI (Incremental Training - Chỉ lấy data 1 ngày qua)
    log("BƯỚC 4: HUẤN LUYỆN AI (DAILY UPDATE)")
    if not run_step("Huấn luyện AI", [VENV_PYTHON, os.path.join(BASE_DIR, "train.py"), "1"]):
        log("Dừng pipeline do lỗi Training.")
        return

    duration = (time.time() - start_time) / 60
    log(f"=== PIPELINE HOÀN TẤT TRONG {duration:.2f} PHÚT ===")

if __name__ == "__main__":
    main()
