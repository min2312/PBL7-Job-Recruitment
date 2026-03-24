"""
TOPCV AUTOMATION CRAWLER - BẢN HOÀN CHỈNH (A-Z)
Mô tả: Bot tự động thu thập dữ liệu việc làm, vượt Cloudflare, chống tràn RAM, 
       và tự động ánh xạ Lĩnh vực (Category) & Địa điểm (Location).
"""

from seleniumbase import Driver
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import os

class TopCVCrawler:
    def __init__(self, start_url, max_pages, csv_file):
        self.start_url = start_url
        self.max_pages = max_pages
        self.csv_file = csv_file
        self.driver = None
        self.session_count = 0
        self.profile_dir = os.path.join(os.getcwd(), "topcv_profile_sb")
        
    def init_driver(self):
        """Khởi tạo hoặc Khởi động lại trình duyệt để xả RAM"""
        if self.driver is not None:
            try:
                self.driver.quit()
            except:
                pass
        print(">>> [HỆ THỐNG] Khởi động động cơ SeleniumBase (UC Mode)...")
        self.driver = Driver(uc=True, user_data_dir=self.profile_dir)
        self.driver.maximize_window()
        self.session_count = 0
        time.sleep(2)

    def pass_cloudflare(self):
        """Hệ thống tự động nhận diện và vượt rào Cloudflare bằng thao tác vật lý"""
        time.sleep(2)
        try:
            page_title = self.driver.get_title().lower()
            page_source = self.driver.get_page_source().lower()
            if "just a moment" in page_title or "cloudflare" in page_title or "challenge" in page_source:
                print("   [🤖] Mạng lưới Cloudflare xuất hiện! Đang gọi Bot rê chuột vật lý...")
                try:
                    self.driver.uc_gui_click_captcha()
                    time.sleep(4)
                except:
                    time.sleep(2)
        except:
            pass 

    def get_links_from_page(self, page_num):
        """Quét và thu thập toàn bộ link việc làm trên một trang cụ thể"""
        url = f"{self.start_url}?page={page_num}"
        try:
            self.driver.uc_open_with_reconnect(url, reconnect_time=4)
            self.pass_cloudflare()
            
            # Cuộn trang để kích hoạt Lazy-load
            for _ in range(12): 
                self.driver.execute_script("window.scrollBy(0, 500);")
                time.sleep(0.3) 
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            
            soup = BeautifulSoup(self.driver.get_page_source(), "lxml")
            jobs = soup.select("div.job-list-default a")
            links = []
            
            for j in jobs:
                link = j.get("href")
                if link and ("/viec-lam/" in link or "/brand/" in link):
                    clean_link = link.split('?')[0] 
                    if clean_link.startswith("http") and clean_link.endswith(".html"):
                        links.append(clean_link)
            
            unique_links = list(dict.fromkeys(links))
            return unique_links
        except Exception as e:
            print(f"[-] Lỗi quét trang {page_num}: {e}")
            return []

    def get_job_detail(self, url):
        """Trích xuất chi tiết công việc với độ chính xác 100%"""
        try:
            # Ép trình duyệt load xong 100% để chống lỗi bất đồng bộ (Async)
            self.driver.get(url)
            self.pass_cloudflare()
            
            try:
                self.driver.wait_for_element_present("h1", timeout=6)
            except:
                pass
                
            time.sleep(1.5) 
            current_url = self.driver.current_url.split("?")[0]
            if current_url == "https://www.topcv.vn/viec-lam-tot-nhat" or current_url == "https://www.topcv.vn/":
                return "JOB_DEAD"
                
            soup = BeautifulSoup(self.driver.get_page_source(), "lxml")
            
            page_title_text = soup.title.get_text(strip=True).lower() if soup.title else ""
            if "việc làm tốt nhất" in page_title_text or "không tìm thấy" in page_title_text:
                return "JOB_DEAD"

            # 🛠 BƯỚC LÀM SẠCH DOM: Phá hủy các phần tử gợi ý để tránh nhiễu dữ liệu
            for trash in soup.select(".job-related, .similar-jobs, .box-suggest-job, #box-suggest-job, .list-suggest-job, .box-related-jobs"):
                trash.decompose()

            # 1. Trích xuất Tiêu đề
            job_title = "N/A"
            for selector in ["h1.job-detail__info--title", "h1.job-title", "h1"]:
                el = soup.select_one(selector)
                if el:
                    name = el.get_text(strip=True)
                    if not name.upper().startswith("CÔNG TY") and not name.upper().startswith("TẬP ĐOÀN"):
                        job_title = name
                        break

            # 2. Trích xuất Tên Công Ty & Logo (Ưu tiên tuyệt đối thẻ ALT của ảnh)
            company_name = "N/A"
            company_logo = "N/A"
            logo_el = soup.select_one(".job-detail__company--logo img, .company-logo img, .box-info-company img")
            
            if logo_el:
                company_logo = logo_el.get("src") if logo_el.get("src") else "N/A"
                if logo_el.get("alt"):
                    company_name = logo_el.get("alt").strip()

            # Phương án dự phòng nếu thiếu Logo
            if company_name == "N/A" or company_name == "":
                for sel in [".company-name", ".job-detail__company--name", ".company-title a", "h2.company-name"]:
                    el = soup.select_one(sel)
                    if el:
                        name = el.get_text(strip=True)
                        if name and not name.startswith("Quy mô") and name.lower() != "xem trang công ty":
                            company_name = name
                            break

            # 3. Trích xuất Thông tin chung
            general_info = {}
            for group in soup.select(".box-general-group-info"):
                title = group.select_one(".box-general-group-info-title")
                value = group.select_one(".box-general-group-info-value")
                if title and value:
                    general_info[title.get_text(strip=True)] = value.get_text(strip=True)

            # 4. Trích xuất Mô tả công việc chi tiết
            full_description = ""
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

            return {
                "job_title": job_title,
                "company_name": company_name,
                "company_logo": company_logo,
                "cap_bac": general_info.get("Cấp bậc", ""),
                "kinh_nghiem": general_info.get("Kinh nghiệm", ""),
                "hoc_van": general_info.get("Học vấn", ""),
                "so_luong": general_info.get("Số lượng tuyển", ""),
                "hinh_thuc": general_info.get("Hình thức làm việc", ""),
                "gioi_tinh": general_info.get("Giới tính", ""),
                "chi_tiet_cong_viec": full_description.strip()
            }
        except Exception as e:
            return "CRASHED"

    def map_category_and_location(self, df):
        """Giai đoạn 3: Ánh xạ Category và Location qua API ẩn của TopCV"""
        print("\n=== GIAI ĐOẠN 3: ÁNH XẠ LĨNH VỰC & ĐỊA ĐIỂM ===")
        self.driver.uc_open_with_reconnect(self.start_url, 4)
        self.pass_cloudflare()
        soup = BeautifulSoup(self.driver.get_page_source(), "lxml")
        
        dict_fields, dict_cities = {}, {}
        for opt in soup.select('select[name="company_field"] option'):
            val = opt.get('value')
            if val and val not in ["0", "", "all"]: dict_fields[val] = opt.text.strip()
                
        for opt in soup.select('select[name="city_id"] option, select#city option'):
            val = opt.get('value')
            if val and val not in ["0", "", "all"]: dict_cities[val] = opt.text.strip()
            
        print(f"[*] Đã nhận diện: {len(dict_fields)} Lĩnh vực và {len(dict_cities)} Địa điểm.")
        
        # Hàm nội bộ lật trang tìm link khớp
        def scan_and_map(param_name, mapping_dict, col_name):
            known_urls = set(df['job_url'].dropna().tolist())
            for key_id, name in mapping_dict.items():
                print(f" -> Lọc [{col_name}]: {name}")
                self.driver.uc_open_with_reconnect(f"{self.start_url}?{param_name}={key_id}&page=1", 3)
                self.pass_cloudflare()
                if "Không tìm thấy" in self.driver.get_page_source(): continue
                
                # Quét trang đầu
                links = self.get_links_from_page(1)
                for link in links:
                    if link in known_urls:
                        current = str(df.loc[df['job_url'] == link, col_name].values[0])
                        if name not in current:
                            df.loc[df['job_url'] == link, col_name] = (current + ", " + name).strip(", ")
                df.to_csv(self.csv_file, index=False, encoding='utf-8-sig')

        # Gọi thực thi (Chỉ quét trang 1 mỗi danh mục để tối ưu tốc độ Demo)
        scan_and_map('company_field', dict_fields, 'category')
        scan_and_map('city_id', dict_cities, 'location')
        return df

    def run(self):
        """Hàm điều phối toàn bộ quy trình A-Z"""
        print(f"[*] Kiểm tra tệp dữ liệu: {self.csv_file}")
        if os.path.isfile(self.csv_file):
            try:
                df = pd.read_csv(self.csv_file)
            except Exception as e:
                print(f"[-] Lỗi đọc file CSV: {e}. Vui lòng tắt Excel!")
                return
        else:
            df = pd.DataFrame(columns=['job_url'])

        # Cân bằng dữ liệu (Xử lý lỗi NaN của Pandas)
        df = df.fillna("")
        for col in ['job_title', 'company_name', 'company_logo', 'cap_bac', 'kinh_nghiem', 'hoc_van', 'so_luong', 'hinh_thuc', 'gioi_tinh', 'chi_tiet_cong_viec', 'category', 'location']:
            if col not in df.columns: df[col] = ""
            df[col] = df[col].astype(str)
        if 'is_data_fixed' not in df.columns: df['is_data_fixed'] = False

        self.init_driver()

        # ==========================================
        # GIAI ĐOẠN 1: QUÉT LINK
        # ==========================================
        print("\n=== GIAI ĐOẠN 1: GOM LINK TỪ TRANG CHỦ ===")
        all_job_links = []
        crawled_links = df['job_url'].dropna().tolist()
        
        for pg in range(1, self.max_pages + 1):
            links = self.get_links_from_page(pg)
            all_job_links.extend(links)
            print(f" -> Trang {pg}: Thu được {len(links)} links")
            time.sleep(random.uniform(1.5, 3))
            
        all_job_links = list(dict.fromkeys(all_job_links))
        new_links = [l for l in all_job_links if l not in crawled_links]
        
        # Thêm các link mới vào DataFrame
        for link in new_links:
            df.loc[len(df)] = {'job_url': link, 'is_data_fixed': False}
        df.to_csv(self.csv_file, index=False, encoding='utf-8-sig')

        # ==========================================
        # GIAI ĐOẠN 2: CÀO CHI TIẾT
        # ==========================================
        total_jobs = len(df)
        jobs_to_fix = len(df[df['is_data_fixed'] == False])
        print(f"\n=== GIAI ĐOẠN 2: TRÍCH XUẤT CHI TIẾT ({jobs_to_fix} jobs) ===")
        
        for index, row in df.iterrows():
            if row.get('is_data_fixed') == True: continue
                
            url = row['job_url']
            print(f"[{index+1}/{total_jobs}] Cào chi tiết: {url}")
            
            new_data = self.get_job_detail(url)
            if new_data == "CRASHED":
                print("   [⚠️] Trình duyệt treo! Tự động Restart...")
                self.init_driver()
                new_data = self.get_job_detail(url)
                
            if new_data == "JOB_DEAD":
                df.at[index, 'job_title'], df.at[index, 'company_name'] = "N/A", "N/A"
                df.at[index, 'is_data_fixed'] = True
            elif isinstance(new_data, dict):
                for key, value in new_data.items():
                    df.at[index, key] = str(value)
                df.at[index, 'is_data_fixed'] = True

            df.to_csv(self.csv_file, index=False, encoding='utf-8-sig')
            
            self.session_count += 1
            if self.session_count >= 40:
                print("   [♻️] Giải phóng RAM...")
                self.init_driver()
            time.sleep(1.2)

        # ==========================================
        # GIAI ĐOẠN 3: ÁNH XẠ DANH MỤC
        # ==========================================
        df = self.map_category_and_location(df)

        print("\n[+] Đã Crawl Thành Công!")
        self.driver.quit()

# Thực thi Code
if __name__ == "__main__":
    crawler = TopCVCrawler(
        start_url="https://www.topcv.vn/viec-lam-tot-nhat",
        max_pages=36,
        csv_file="topcv_jobs_final.csv" # Khởi tạo file xuất kết quả cuối cùng
    )
    crawler.run()