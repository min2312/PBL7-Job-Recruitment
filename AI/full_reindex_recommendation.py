import os
import sys
import pandas as pd
import numpy as np
import joblib
import requests
import time
from sentence_transformers import SentenceTransformer
import faiss
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer

# Đảm bảo in được tiếng Việt
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Cấu hình
BASE_URL = os.getenv('BACKEND_URL', 'http://localhost:8081')
RECOMMEND_API = f'{BASE_URL}/api/neo4j/recommendation-dataset'
from model_manager import get_and_sync_model_dir

MODEL_REC_DIR = get_and_sync_model_dir('recommendation')

def fetch_all_recommendation_data():
    # Không truyền tham số days để lấy TOÀN BỘ database
    print(f"-> Đang lấy TOÀN BỘ dữ liệu từ {RECOMMEND_API}...")
    try:
        response = requests.get(RECOMMEND_API, timeout=120)
        response.raise_for_status()
        json_data = response.json()
        if json_data['errCode'] == 0:
            return pd.DataFrame(json_data['data'])
        else:
            raise Exception("Lỗi API: " + json_data['errMessage'])
    except Exception as e:
        print(f"!!! LỖI khi kết nối API: {e}")
        return pd.DataFrame()

from reco_utils import clean_text, remove_accents
from sklearn.preprocessing import normalize

def rebuild_index():
    os.makedirs(MODEL_REC_DIR, exist_ok=True)
    
    # 1. Lấy dữ liệu
    df = fetch_all_recommendation_data()
    df_path = os.path.join(MODEL_REC_DIR, 'df.pkl')
    
    if df.empty:
        if os.path.exists(df_path):
            print(f"-> API không khả dụng. Đang dùng tạm dữ liệu từ {df_path}...")
            df = joblib.load(df_path)
        else:
            print("-> Không có dữ liệu để đánh chỉ mục. Hãy chắc chắn bạn đã sync dữ liệu sang Neo4j.")
            return

    print(f"-> Đang xử lý {len(df)} jobs...")
    
    # Tạo các cột đã được làm sạch
    df['category_clean'] = df['category'].apply(clean_text)
    df['job_title_clean'] = df['job_title'].apply(clean_text)

    # 2. Encode văn bản (Semantic)
    print("-> Đang tải model AI (SentenceTransformer)...")
    model_st = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    print("-> Đang chuyển đổi văn bản thành Vector (Embedding)...")
    # Kết hợp Title và Mô tả (Giống notebook)
    texts = (df['job_title'].fillna('') + " " + df['chi_tiet_cong_viec'].fillna('')).tolist()
    # QUAN TRỌNG: normalize_embeddings=True
    embeddings = model_st.encode(texts, show_progress_bar=True, normalize_embeddings=True).astype('float32')

    # 3. Xây dựng FAISS Index mới hoàn toàn
    print("-> Đang xây dựng FAISS Index...")
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    # 4. Huấn luyện Classifier phân loại ngành (Dùng cho query)
    print("-> Đang huấn luyện bộ phân loại ngành nghề...")
    # Notebook logic: job_title_clean -> category
    # THÊM: token_pattern để không bỏ lỡ các từ như 'R', 'D' (trong R&D)
    vectorizer_cls = TfidfVectorizer(max_features=5000, token_pattern=r"(?u)\b\w+\b", ngram_range=(1,2))
    X_vec = vectorizer_cls.fit_transform(df['job_title_clean'])
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_vec, df['category'])

    # 5. Tạo cat_vectorizer (để tìm ngành tương đương)
    print("-> Đang tạo bộ vector hóa ngành nghề...")
    unique_cats = df['category_clean'].unique()
    cat_vectorizer = TfidfVectorizer(ngram_range=(1,2))
    cat_tfidf = cat_vectorizer.fit_transform(unique_cats)
    cat_tfidf = normalize(cat_tfidf)

    # 6. Location embeddings
    print("-> Đang tạo embedding vị trí...")
    location_embeddings = model_st.encode(df['location'].fillna('').tolist(), normalize_embeddings=True)

    # 7. Lưu lại toàn bộ vào thư mục models/recommendation
    print(f"-> Đang lưu kết quả vào {MODEL_REC_DIR}...")
    faiss.write_index(index, os.path.join(MODEL_REC_DIR, 'faiss.index'))
    joblib.dump(df, os.path.join(MODEL_REC_DIR, 'df.pkl'))
    joblib.dump(clf, os.path.join(MODEL_REC_DIR, 'clf.pkl'))
    joblib.dump(vectorizer_cls, os.path.join(MODEL_REC_DIR, 'vectorizer_cls.pkl'))
    joblib.dump(cat_vectorizer, os.path.join(MODEL_REC_DIR, 'cat_vectorizer.pkl'))
    joblib.dump(cat_tfidf, os.path.join(MODEL_REC_DIR, 'cat_tfidf.pkl'))
    joblib.dump(unique_cats, os.path.join(MODEL_REC_DIR, 'unique_cats.pkl'))
    joblib.dump(location_embeddings, os.path.join(MODEL_REC_DIR, 'location_embeddings.pkl'))
    
    print(f"=== HOÀN TẤT: Đã đánh chỉ mục thành công {len(df)} jobs! ===")

if __name__ == "__main__":
    start_time = time.time()
    rebuild_index()
    print(f"Thời gian thực hiện: {time.time() - start_time:.2f} giây")
