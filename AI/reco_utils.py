import re
import unicodedata
import numpy as np
import os
import joblib
import faiss
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

def remove_accents(text):
    if not text:
        return ""
    return ''.join(
        c for c in unicodedata.normalize('NFD', str(text))
        if unicodedata.category(c) != 'Mn'
    )

def clean_text(text):
    if not text:
        return ""
    text = str(text).lower()
    text = remove_accents(text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

class RecommendationEngine:
    def __init__(self, model_dir='models/recommendation'):
        self.model_dir = model_dir
        self.model_st = None
        self.artifacts = {}
        self.is_loaded = False

    def load_all(self):
        if self.is_loaded:
            return
        
        print(f"Loading recommendation artifacts from {self.model_dir}...")
        self.model_st = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        
        paths = {
            'df': 'df.pkl',
            'index': 'faiss.index',
            'clf': 'clf.pkl',
            'vectorizer_cls': 'vectorizer_cls.pkl',
            'cat_vectorizer': 'cat_vectorizer.pkl',
            'cat_tfidf': 'cat_tfidf.pkl',
            'unique_cats': 'unique_cats.pkl',
            'location_embeddings': 'location_embeddings.pkl'
        }
        
        for key, filename in paths.items():
            path = os.path.join(self.model_dir, filename)
            if not os.path.exists(path):
                print(f"Warning: Missing artifact {path}")
                continue
                
            if key == 'index':
                self.artifacts[key] = faiss.read_index(path)
            else:
                self.artifacts[key] = joblib.load(path)
        
        self.is_loaded = True
        print("All artifacts loaded successfully.")

    def get_similar_categories(self, main_cat, top_k=5):
        if 'cat_vectorizer' not in self.artifacts or 'cat_tfidf' not in self.artifacts:
            return [clean_text(main_cat)]
            
        cat_vectorizer = self.artifacts['cat_vectorizer']
        cat_tfidf = self.artifacts['cat_tfidf']
        unique_cats = self.artifacts['unique_cats']
        
        main_vec = cat_vectorizer.transform([clean_text(main_cat)])
        main_vec = normalize(main_vec)
        
        scores = (cat_tfidf @ main_vec.T).toarray().flatten()
        top_idx = scores.argsort()[::-1][:top_k]
        
        return unique_cats[top_idx]

    def predict_category(self, query):
        if 'clf' not in self.artifacts or 'vectorizer_cls' not in self.artifacts:
            return "Unknown"
        
        vectorizer = self.artifacts['vectorizer_cls']
        clf = self.artifacts['clf']
        
        q_vec = vectorizer.transform([clean_text(query)])
        return clf.predict(q_vec)[0]

    def recommend(self, query, top_k=10, exclude_id=None):
        self.load_all()
        
        df = self.artifacts.get('df')
        index = self.artifacts.get('index')
        
        if df is None or index is None:
            return []

        # 1. Predict category & find similar ones
        main_cat = self.predict_category(query)
        similar_cats = self.get_similar_categories(main_cat, top_k=5)
        
        # 2. Semantic Search (FAISS)
        # normalize_embeddings=True matches the notebook's logic
        query_embed = self.model_st.encode([clean_text(query)], normalize_embeddings=True)
        scores, indices = index.search(query_embed.astype('float32'), 200) # Search a larger pool
        
        candidates = df.iloc[indices[0]].copy()
        candidates['semantic_score'] = scores[0]
        
        # Ensure category_clean exists for filtering
        if 'category_clean' not in candidates.columns:
            candidates['category_clean'] = candidates['category'].apply(clean_text)

        # 3. Filter by similar categories
        # Filter first, then fallback if needed
        filtered_candidates = candidates[candidates['category_clean'].isin(similar_cats)].copy()
        
        # Fallback if too few results after filtering
        if len(filtered_candidates) < 5:
            filtered_candidates = candidates.copy()

        # 4. Location Scoring (EXACT logic from notebook line 1335)
        if not filtered_candidates.empty:
            main_location = filtered_candidates.iloc[0]['location']
            filtered_candidates['loc_score'] = filtered_candidates['location'].apply(
                lambda x: 1 if clean_text(x) == clean_text(main_location) else 0
            )
            
            # 5. Ranking (EXACT logic from notebook line 1341)
            filtered_candidates['final_score'] = (
                filtered_candidates['semantic_score'] * 0.8 +
                filtered_candidates['loc_score'] * 0.2
            )
        else:
            filtered_candidates['final_score'] = 0

        # 6. Remove excluded ID
        if exclude_id:
            filtered_candidates = filtered_candidates[filtered_candidates['id'].astype(str) != str(exclude_id)]
            
        # 7. Format results
        results = []
        for _, row in filtered_candidates.sort_values('final_score', ascending=False).head(top_k).iterrows():
            results.append({
                "id": str(row.get('id', '')),
                "job_title": row['job_title'],
                "category": row['category'],
                "location": row['location'],
                "score": float(row['final_score']),
                "semantic_score": float(row['semantic_score']),
                "loc_score": float(row.get('loc_score', 0)),
                "predicted_category": main_cat
            })
            
        return results
