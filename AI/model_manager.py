import os
import shutil

def get_and_sync_model_dir(subpath=""):
    """
    Trả về đường dẫn thư mục model. Nếu chạy trên Azure, tự động dùng /home/data/ai_models.
    Nếu model chưa có trong /home/data, tự động copy từ thư mục models gốc của repo sang.
    """
    local_base = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
    
    # Kiểm tra nếu đang chạy trên máy chủ Azure App Service Linux
    if os.path.exists('/home/data'):
        persistent_base = '/home/data/ai_models'
        persistent_target = os.path.join(persistent_base, subpath) if subpath else persistent_base
        local_target = os.path.join(local_base, subpath) if subpath else local_base

        # Nếu thư mục persistent chưa tồn tại hoặc rỗng, tiến hành copy từ code gốc sang
        if not os.path.exists(persistent_target) or not os.listdir(persistent_target):
            print(f"🔄 Đang đồng bộ lần đầu từ {local_target} sang đĩa vĩnh viễn {persistent_target}...")
            os.makedirs(persistent_target, exist_ok=True)
            if os.path.exists(local_target):
                for item in os.listdir(local_target):
                    s = os.path.join(local_target, item)
                    d = os.path.join(persistent_target, item)
                    if os.path.isdir(s):
                        shutil.copytree(s, d, dirs_exist_ok=True)
                    else:
                        shutil.copy2(s, d)
            print("✅ Đồng bộ Model vĩnh viễn thành công!")
            
        return persistent_target
    else:
        # Nếu chạy dưới Local PC của bạn
        target = os.path.join(local_base, subpath) if subpath else local_base
        os.makedirs(target, exist_ok=True)
        return target
