"""
TOPCV DAILY CRAWLER - API/HTTP VERSION
Chiến lược: Dùng curl_cffi trực tiếp để giả lập trình duyệt và vượt qua Cloudflare.
            Không cần mở trình duyệt lấy cookie. Thích hợp chạy Cron job trên server.
"""

import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from curl_cffi import requests as curl_requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import os
import json
from datetime import datetime
from fake_useragent import UserAgent
from sqlalchemy import create_engine, text
import numpy as np
from dotenv import load_dotenv

# Load environmental variables
load_dotenv()

CHROME_VERSIONS = [
    "chrome120", "chrome124", "chrome123", "chrome119",
]


class DailyTopCVCrawler:
    def __init__(self, start_url=None, daily_csv=None):
        self.start_url = start_url or os.getenv("START_URL")
        self.daily_csv = daily_csv
        self.crawled_urls = set()
        self.today_str = datetime.now().strftime("%Y-%m-%d")
        self.ua = UserAgent()

        # Database connection from .env
        db_user = os.getenv("DB_USER")
        db_pass = os.getenv("DB_PASS", "")
        db_host = os.getenv("DB_HOST")
        db_port = os.getenv("DB_PORT")
        db_name = os.getenv("DB_NAME")
        
        db_url = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        self.db_engine = create_engine(db_url)
        
        self.http_session = None
        self.request_count = 0

    # ==================================================
    # HTTP SESSION (GIẢ LẬP TRÌNH DUYỆT)
    # ==================================================
    def init_http_session(self):
        """Tạo HTTP session giả lập trình duyệt Chrome bằng curl_cffi"""
        impersonate = random.choice(CHROME_VERSIONS)
        self.http_session = curl_requests.Session(impersonate=impersonate)
        
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"


        self.http_session.headers.update({
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        })
        self.request_count = 0
        print(f"   [🔄] HTTP Session khởi tạo | Impersonate: {impersonate} | UA: {user_agent[:50]}...")

    def fetch_page(self, url, retries=3):
        """GET request nhanh bằng curl_cffi"""
        for attempt in range(retries):
            try:
                resp = self.http_session.get(url, timeout=20)
                if resp.status_code == 200:
                    self.request_count += 1
                    return resp.text
                elif resp.status_code == 403:
                    if attempt < retries - 1:
                        print(f"   [⚠️] 403 Forbidden! Thử lại ({attempt + 1}/{retries})...")
                        time.sleep(random.uniform(2, 4))
                    else:
                        print("   [❌] Bị Cloudflare 403. Đổi Session...")
                        self.init_http_session()
                        return None
                elif resp.status_code == 429:
                    wait = random.uniform(8, 15)
                    print(f"   [⚠️] 429 Rate Limited! Chờ {wait:.0f}s...")
                    time.sleep(wait)
                else:
                    print(f"   [⚠️] HTTP {resp.status_code}. Thử lại...")
                    time.sleep(2)
            except Exception as e:
                print(f"   [❌] Lỗi: {e}. Thử lại ({attempt + 1}/{retries})...")
                time.sleep(3)
        return None

    # ==================================================
    # CHỐNG TRÙNG LẶP (DATABASE BACKED)
    # ==================================================
    def load_existing_urls(self):
        """Kiểm tra MySQL để lấy danh sách URL đã tồn tại"""
        print("[*] Đang tải danh sách link đã có từ Database (MySQL)...")
        try:
            with self.db_engine.connect() as conn:
                result = conn.execute(text("SELECT job_url FROM jobs"))
                self.crawled_urls = {row[0] for row in result if row[0]}
            print(f"[*] Đã tải {len(self.crawled_urls)} links từ DB. Sẵn sàng quét link mới.")
        except Exception as e:
            print(f"[-] Lỗi kết nối DB: {e}. Sẽ dùng file tạm nếu có.")

    # ==================================================
    # GIAI ĐOẠN 1: QUÉT LINK
    # ==================================================
    def get_links_from_page(self, page_num):
        """Lấy link việc làm trên 1 trang. None = hết trang."""
        url = f"{self.start_url}?page={page_num}"
        html = self.fetch_page(url)

        if html is None:
            return None

        soup = BeautifulSoup(html, "lxml")

        if "Không tìm thấy kết quả" in soup.get_text():
            return None

        jobs = soup.select("div.job-list-default a")
        links = []
        for j in jobs:
            link = j.get("href")
            if link and "/viec-lam/" in link:
                clean_link = link.split('?')[0]

                if clean_link.startswith("http") and clean_link.endswith(".html"):
                    links.append(clean_link)

        unique_links = list(dict.fromkeys(links))
        if len(unique_links) == 0:
            return None
        return unique_links

    # ==================================================
    # GIAI ĐOẠN 2: CÀO CHI TIẾT
    # ==================================================
    def get_job_detail(self, url):
        """Cào chi tiết 1 công việc + thông tin công ty"""
        html = self.fetch_page(url)
        if html is None:
            return "CRASHED"

        soup = BeautifulSoup(html, "lxml")

        page_title_text = soup.title.get_text(strip=True).lower() if soup.title else ""
        if "việc làm tốt nhất" in page_title_text or "không tìm thấy" in page_title_text:
            return "JOB_DEAD"

        for trash in soup.select(
            ".job-related, .similar-jobs, .box-suggest-job, "
            "#box-suggest-job, .list-suggest-job, .box-related-jobs"
        ):
            trash.decompose()

        # Tiêu đề
        job_title = "N/A"
        for selector in ["h1.job-detail__info--title", "h1.job-title", "h1"]:
            el = soup.select_one(selector)
            if el:
                name = el.get_text(strip=True)
                if not name.upper().startswith("CÔNG TY") and not name.upper().startswith("TẬP ĐOÀN"):
                    job_title = name
                    break

        # Công ty & Logo
        company_name = "N/A"
        company_logo = "N/A"
        logo_el = soup.select_one(
            ".job-detail__company--logo img, .company-logo img, .box-info-company img, .company-logo-img img"
        )
        if logo_el:
            company_logo = logo_el.get("src", "N/A")
            if logo_el.get("alt"):
                company_name = logo_el.get("alt").strip()

        if company_name in ("N/A", ""):
            for sel in [".company-name", ".job-detail__company--name",
                        ".company-title a", "h2.company-name", ".company-name-label a.name"]:
                el = soup.select_one(sel)
                if el:
                    name = el.get_text(strip=True)
                    if name and not name.startswith("Quy mô") and name.lower() != "xem trang công ty":
                        company_name = name
                        break

        # 3. Thông tin chung
        general_info = {}
        
        # Thử lấy từ các section ở header
        for section in soup.select(".job-detail__info--sections > div"):
            title_el = section.select_one(".job-detail__info--section-content-title")
            value_el = section.select_one(".job-detail__info--section-content-value")
            if title_el and value_el:
                general_info[title_el.get_text(strip=True)] = value_el.get_text(strip=True)

        # Thử lấy từ các box thông tin ở sidebar
        for group in soup.select(".box-general-group-info"):
            title_el = group.select_one(".box-general-group-info-title")
            value_el = group.select_one(".box-general-group-info-value")
            if title_el and value_el:
                general_info[title_el.get_text(strip=True)] = value_el.get_text(strip=True)

        # Thu thập bổ sung từ thuộc tính text linh hoạt (không phụ thuộc class)
        keywords = {
            "Mức lương": ["mức lương", "lương"],
            "Kinh nghiệm": ["kinh nghiệm", "kn"],
            "Cấp bậc": ["cấp bậc"],
            "Học vấn": ["học vấn"],
            "Số lượng tuyển": ["số lượng tuyển", "số lượng"],
            "Hình thức làm việc": ["hình thức làm việc", "hình thức"],
            "Địa điểm": ["địa điểm"],
        }
        
        for kw_canonical, aliases in keywords.items():
            if kw_canonical in general_info and general_info[kw_canonical].strip() not in ("", "N/A"):
                continue
            for item in soup.select("div, span, p, li"):
                text = item.get_text(" ", strip=True)
                for alias in aliases:
                    if text.lower().startswith(alias.lower()) and ":" in text:
                        parts = text.split(":", 1)
                        if len(parts) > 1:
                            val = parts[1].strip()
                            if val and len(val) < 100:
                                general_info[kw_canonical] = val
                                break


        # 4. Ngành nghề
        categories = []
        for cat in soup.select(".job-tags__group-list-tag-scroll a, .box-category .box-category-tag"):
            text = cat.get_text(strip=True)
            if "tại " not in text.lower() and "việc làm" not in text.lower():
                categories.append(text)
        categories = list(dict.fromkeys(categories))
        category_str = ", ".join(categories[:5])

        # 5. Mô tả chi tiết
        full_description = ""
        desc_div = soup.select_one(".job-description") or soup.select_one(".job-detail__information-detail--content")
        if desc_div:
            for item in desc_div.select(".job-description__item"):
                header = item.select_one("h3")
                header_text = header.get_text(strip=True).upper() + ":\n" if header else ""
                content_div = item.select_one(".job-description__item--content")
                if not content_div:
                    content_div = item
                content_text = content_div.get_text("\n", strip=True)
                if content_text:
                    full_description += header_text + content_text + "\n\n"
        
        # Nếu vẫn trống, lấy thô toàn bộ
        if not full_description.strip():
            for item in soup.select(".job-description__item, .job-detail__information-detail--content"):
                header = item.select_one("h3")
                header_text = header.get_text(strip=True).upper() + ":\n" if header else ""
                content_div = item.select_one(".job-description__item--content")
                if not content_div:
                    content_div = item
                if header and content_div.find("h3"):
                    header.decompose()
                content_text = content_div.get_text("\n", strip=True)
                if content_text:
                    full_description += header_text + content_text + "\n\n"

        # 6. Thông tin công ty bổ sung
        company_url = "N/A"
        company_link_el = soup.select_one(".company-name-label a.name") or \
                          soup.select_one(".company-info a[href*='/cong-ty/']") or \
                          soup.select_one(".name[href*='/cong-ty/']") or \
                          soup.select_one(".job-detail__company--name a") or \
                          soup.select_one(".company-name a")
        if company_link_el:
            company_url = company_link_el.get("href", "N/A").split('?')[0]
            if not company_url.startswith("http"):
                company_url = "https://www.topcv.vn" + company_url

        company_intro = "N/A"
        company_website = "N/A"
        company_scale = "N/A"
        company_address = "N/A"
        category_str = "N/A"

        # Thử lấy scale, address, category ngay tại trang Job nếu có
        scale_el = soup.select_one(".company-scale .company-value")
        if scale_el:
            company_scale = scale_el.get_text(strip=True)

        field_el = soup.select_one(".company-field .company-value")
        if field_el:
            category_str = field_el.get_text(strip=True)

        addr_el = soup.select_one(".company-address .company-value")
        if addr_el:
            company_address = addr_el.get_text(strip=True)


        if company_url != "N/A" and (company_intro == "N/A" or company_website == "N/A" or company_scale == "N/A"):
            time.sleep(random.uniform(0.5, 1.2))
            comp_html = self.fetch_page(company_url)
            if comp_html:
                comp_soup = BeautifulSoup(comp_html, "lxml")
                
                # Website
                web_el = comp_soup.select_one('a.company-subdetail-info-text[href^="http"]') or \
                         comp_soup.select_one('a.company-subdetail-info-text')
                if web_el:
                    company_website = web_el.get("href", "N/A")
                    
                # Scale (Số lượng nhân viên)
                if company_scale == "N/A":
                    scale_el = comp_soup.select_one('.company-main-info i.fa-users + .company-subdetail-info-text')
                    if scale_el:
                        company_scale = scale_el.get_text(strip=True)
                    else:
                        for item in comp_soup.select('.company-subdetail-info-text, .company-info__subdetail--item'):
                            text = item.get_text(strip=True)
                            if "nhân viên" in text.lower():
                                company_scale = text
                                break
                    
                # Giới thiệu công ty
                intro_el = comp_soup.select_one('#section-introduce .company-info .content') or \
                           comp_soup.select_one('.company-info .content') or \
                           comp_soup.select_one('.company-introduction .company-description') or \
                           comp_soup.select_one('.company-introduction .company-introduction-content')
                if intro_el:
                    company_intro = intro_el.get_text("\n", strip=True)
                    
                # Địa chỉ công ty
                if company_address == "N/A":
                    addr_el = comp_soup.select_one('#section-contact .desc') or \
                              comp_soup.select_one('#section-contact .item .desc') or \
                              comp_soup.select_one('.company-address') or \
                              comp_soup.select_one('.company-info-address')
                    if addr_el:
                        company_address = addr_el.get_text(strip=True)
                        
        def get_loose_value(search_key, default="N/A"):
            for k, v in general_info.items():
                if search_key.lower() in k.lower():
                    return v.strip()
            return default

        muc_luong = get_loose_value("Mức lương")
        if muc_luong == "N/A":
            muc_luong = get_loose_value("Thu nhập")

        return {
            "job_title": job_title,
            "company_name": company_name,
            "company_logo": company_logo,
            "cap_bac": get_loose_value("Cấp bậc"),
            "kinh_nghiem": get_loose_value("Kinh nghiệm"),
            "hoc_van": get_loose_value("Học vấn"),
            "so_luong": get_loose_value("Số lượng tuyển"),
            "hinh_thuc": get_loose_value("Hình thức làm việc"),
            "gioi_tinh": get_loose_value("Giới tính", "Không yêu cầu"),
            "chi_tiet_cong_viec": full_description.strip(),
            "category": category_str,

            "location": re.sub(r"\s+và\s+\d+\s+nơi\s+khác.*", "", get_loose_value("Địa điểm"), flags=re.IGNORECASE).strip(),
            "muc_luong": muc_luong,
            "company_url": company_url,
            "company_intro": company_intro,
            "company_website": company_website,
            "company_scale": company_scale,
            "company_address": company_address,
        }

    # ==================================================
    # GIAI ĐOẠN 3: ÁNH XẠ DANH MỤC & ĐỊA ĐIỂM
    # ==================================================
    def map_category_and_location(self, df):
        """Ánh xạ Category và Location qua API/URL ẩn của TopCV"""
        print(f"\n{'=' * 50}")
        print("  GIAI ĐOẠN 3: ÁNH XẠ LĨNH VỰC & ĐỊA ĐIỂM")
        print(f"{'=' * 50}")
        
        # Kiểm tra xem có job nào bị thiếu category/location không
        missing_cat = df[(df['category'].isna()) | (df['category'].isin(['N/A', '', 'nan']))]
        missing_loc = df[(df['location'].isna()) | (df['location'].isin(['N/A', '', 'nan']))]
        
        if len(missing_cat) == 0 and len(missing_loc) == 0:
            print("[*] Tất cả các job đã có đầy đủ Lĩnh vực và Địa điểm. Bỏ qua Giai đoạn 3.")
            return df

        
        html = self.fetch_page(self.start_url)
        if not html:
            print("[-] Không thể tải trang chủ để lấy danh mục.")
            return df
            
        soup = BeautifulSoup(html, "lxml")
        dict_fields = {}
        dict_cities = {}
        
        for opt in soup.select('select[name="company_field"] option'):
            val = opt.get('value')
            if val and val not in ["0", "", "all"]:
                dict_fields[val] = opt.get_text(strip=True)
                
        for opt in soup.select('select[name="city_id"] option, select#city option'):
            val = opt.get('value')
            if val and val not in ["0", "", "all"]:
                dict_cities[val] = opt.get_text(strip=True)
                
        print(f"[*] Đã nhận diện: {len(dict_fields)} Lĩnh vực và {len(dict_cities)} Địa điểm.")
        
        known_urls = set(df['job_url'].dropna().tolist())

        def scan_and_map(param_name, mapping_dict, col_name):
            for key_id, name in mapping_dict.items():
                print(f" -> Lọc [{col_name}]: {name}", flush=True)
                page_num = 1
                
                while True:
                    url = f"{self.start_url}?{param_name}={key_id}&page={page_num}"
                    page_html = self.fetch_page(url)
                    if not page_html or "Không tìm thấy kết quả" in page_html:
                        break
                        
                    page_soup = BeautifulSoup(page_html, "lxml")
                    jobs = page_soup.select("div.job-list-default a")
                    links_found = 0
                    
                    for j in jobs:
                        link = j.get("href")
                        if link and "/viec-lam/" in link:
                            clean_link = link.split('?')[0]
                            if clean_link.startswith("http") and clean_link.endswith(".html"):
                                if clean_link in known_urls:
                                    links_found += 1
                                    current = str(df.loc[df['job_url'] == clean_link, col_name].values[0])
                                    if current in ("N/A", "", "nan"):
                                        current = ""
                                    if name not in current:
                                        new_val = (current + ", " + name).strip(", ")
                                        df.loc[df['job_url'] == clean_link, col_name] = new_val
                                        
                    df.to_csv(self.daily_csv, index=False, encoding='utf-8-sig')
                    
                    if links_found == 0:
                        next_btn = page_soup.select_one("ul.pagination li.active + li a")
                        if not next_btn:
                            break
                    
                    page_num += 1
                    time.sleep(random.uniform(0.1, 0.4))
                    
        scan_and_map('company_field', dict_fields, 'category')
        scan_and_map('city_id', dict_cities, 'location')
        return df



    # ==================================================
    # MAIN RUN
    # ==================================================
    def run(self):
        self.load_existing_urls()
        self.init_http_session()

        all_columns = [
            'job_url', 'job_title', 'company_name', 'company_logo', 'cap_bac',
            'kinh_nghiem', 'hoc_van', 'so_luong', 'hinh_thuc', 'gioi_tinh',
            'chi_tiet_cong_viec', 'category', 'location', 'is_data_fixed',
            'muc_luong', 'is_salary_fixed', 'crawl_date',
            'company_url', 'company_intro', 'company_website', 'company_scale', 'company_address'
        ]

        if os.path.isfile(self.daily_csv):
            df = pd.read_csv(self.daily_csv, dtype=str)
            df['is_data_fixed'] = df['is_data_fixed'].map(
                lambda x: True if str(x).strip().lower() == 'true' else False
            )
            
            # Loại bỏ các link rác (/brand/) khỏi DataFrame
            initial_len = len(df)
            df = df[~df['job_url'].str.contains('/brand/', na=False)].copy()
            removed_brands = initial_len - len(df)
            if removed_brands > 0:
                print(f"[*] Đã loại bỏ {removed_brands} link rác (/brand/) khỏi danh sách.")

            # Reset các job bị lỗi (N/A, nan, trống) để cào lại
            def needs_refix(row):
                if not row.get('is_data_fixed'):
                    return True
                if '/viec-lam/' in str(row.get('job_url')):
                    for field in ['job_title', 'cap_bac', 'kinh_nghiem', 'hinh_thuc', 'muc_luong']:
                        val = str(row.get(field)).strip().lower()
                        if val in ('n/a', '', 'nan'):
                            return False
                return True

                
            df['is_data_fixed'] = df.apply(lambda r: False if not needs_refix(r) else r['is_data_fixed'], axis=1)

            for u in df['job_url'].dropna().tolist():
                self.crawled_urls.add(u)
            print(f"[*] Resume: {len(df)} dòng trong {self.daily_csv}")

        else:
            df = pd.DataFrame(columns=all_columns)
            for col in all_columns:
                df[col] = df[col].astype(object)

        # GIAI ĐOẠN 1: TÌM LINK MỚI
        print(f"\n{'=' * 50}")
        print(f"  GIAI ĐOẠN 1: TÌM LINK MỚI (Ngày: {self.today_str})")
        print(f"{'=' * 50}")

        current_blanks = len(df[df['is_data_fixed'] != True])
        print(f"[*] Đang có {current_blanks} jobs trống cần cào chi tiết.")

        page_num = 1
        total_new = 0
        consecutive_empty = 0

        while True:
            if current_blanks + total_new >= 100:
                print(f" [*] Đã đủ hạn mức xử lý 100 jobs cho hôm nay. Dừng quét.", flush=True)
                break
                
            print(f" -> Trang {page_num}...", end=" ", flush=True)
            links = self.get_links_from_page(page_num)

            if links is None:
                print("HẾT TRANG.", flush=True)
                break

            new_links = [l for l in links if l not in self.crawled_urls]
            
            if current_blanks + total_new + len(new_links) > 100:
                needed = 100 - (current_blanks + total_new)
                new_links = new_links[:needed]
                
            total_new += len(new_links)
            print(f"Tổng: {len(links)} | Mới: {len(new_links)}", flush=True)

            if len(new_links) == 0:
                consecutive_empty += 1
                if consecutive_empty >= 5:
                    print(f" [*] 5 trang liên tiếp không có link mới. Dừng.", flush=True)
                    break
            else:
                consecutive_empty = 0

            for link in new_links:
                new_row = {col: "" for col in all_columns}
                new_row['job_url'] = link
                new_row['is_data_fixed'] = False
                new_row['crawl_date'] = self.today_str
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
                self.crawled_urls.add(link)

            df.to_csv(self.daily_csv, index=False, encoding='utf-8-sig')
            page_num += 1
            time.sleep(random.uniform(1.0, 2.5))

        print(f"\n[*] Tổng link mới: {total_new}", flush=True)

        # GIAI ĐOẠN 2: CÀO CHI TIẾT
        jobs_to_fix = df[df['is_data_fixed'] != True]
        print(f"\n{'=' * 50}")
        print(f"  GIAI ĐOẠN 2: CÀO CHI TIẾT ({len(jobs_to_fix)} jobs)")
        print(f"{'=' * 50}")

        for index, row in df.iterrows():
            if row.get('is_data_fixed') == True:
                continue

            url = row['job_url']
            print(f" [{index + 1}/{len(df)}] {url[:75]}...", end=" ", flush=True)

            data = None
            for attempt in range(4):
                data = self.get_job_detail(url)
                if data != "CRASHED":
                    break
                print(f"CRASHED -> Chờ 10s & Đổi Session (Thử lại {attempt + 1}/4)...", end=" ", flush=True)
                time.sleep(random.uniform(8, 12))
                self.init_http_session()

            if data == "JOB_DEAD":
                df.at[index, 'job_title'] = "N/A"
                df.at[index, 'company_name'] = "N/A"
                df.at[index, 'is_data_fixed'] = True
                print("JOB DEAD", flush=True)
            elif isinstance(data, dict):
                for key, value in data.items():
                    df.at[index, key] = str(value)
                df.at[index, 'is_data_fixed'] = True
                print("OK", flush=True)
            else:
                print("SKIP (Không lấy được data)", flush=True)

            df.to_csv(self.daily_csv, index=False, encoding='utf-8-sig')


            # Đợi lâu hơn giữa các job để tránh Cloudflare phát hiện
            time.sleep(random.uniform(5.0, 10.0))

        df = self.map_category_and_location(df)
        df.to_csv(self.daily_csv, index=False, encoding='utf-8-sig')


        print(f"\n{'=' * 50}")
        print(f"  HOÀN THÀNH! Ngày: {self.today_str}")
        print(f"  File: {self.daily_csv}")
        print(f"  Tổng jobs mới: {total_new}")
        print(f"{'=' * 50}")


if __name__ == "__main__":
    import sys
    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Ưu tiên lấy tên file từ argument (do Master script truyền vào)
    if len(sys.argv) > 1:
        DAILY_CSV = sys.argv[1]
    else:
        DAILY_CSV = f"topcv_daily_{now_str}.csv"

    print(f"--- BẮT ĐẦU CRAWL JOB TOPCV ({now_str}) ---", flush=True)
    crawler = DailyTopCVCrawler(
        daily_csv=DAILY_CSV,
    )
    crawler.run()
