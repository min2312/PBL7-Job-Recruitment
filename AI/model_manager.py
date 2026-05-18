import os
import sys
import shutil

def get_and_sync_model_dir(subpath=""):
    """
    Trả về đường dẫn thư mục model. Nếu chạy trên Azure Linux, tự động dùng /home/ai_models.
    Nếu model chưa có trong /home/ai_models, tự động copy từ thư mục models gốc của repo sang.
    """
    local_base = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
    
    # Kiểm tra nếu đang chạy trên máy chủ Azure App Service Linux (/home luôn tồn tại)
    if sys.platform != "win32" and os.path.exists('/home'):
        persistent_base = '/home/ai_models'
        persistent_target = os.path.join(persistent_base, subpath) if subpath else persistent_base
        local_target = os.path.join(local_base, subpath) if subpath else local_base

        # Kiểm tra xem có cần đồng bộ (chưa tồn tại, rỗng, hoặc file trong code mới hơn)
        need_sync = False
        if not os.path.exists(persistent_target) or not os.listdir(persistent_target):
            need_sync = True
        elif os.path.exists(local_target):
            for item in os.listdir(local_target):
                s = os.path.join(local_target, item)
                d = os.path.join(persistent_target, item)
                if os.path.isfile(s) and (not os.path.exists(d) or os.path.getmtime(s) > os.path.getmtime(d) + 5):
                    need_sync = True
                    break

        if need_sync:
            print(f"🔄 Đang đồng bộ cập nhật từ {local_target} sang đĩa vĩnh viễn {persistent_target}...")
            os.makedirs(persistent_target, exist_ok=True)
            if os.path.exists(local_target):
                for item in os.listdir(local_target):
                    s = os.path.join(local_target, item)
                    d = os.path.join(persistent_target, item)
                    if os.path.isdir(s):
                        shutil.copytree(s, d, dirs_exist_ok=True)
                    else:
                        shutil.copy2(s, d)
            print(f"✅ Đồng bộ Model vĩnh viễn thành công vào {persistent_target}!")
            
        return persistent_target
    else:
        # Nếu chạy dưới Local PC của bạn (Windows / macOS)
        target = os.path.join(local_base, subpath) if subpath else local_base
        os.makedirs(target, exist_ok=True)
        return target
