import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Facebook, Linkedin, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  const jobLinks = [
    'Việc làm', 'Việc làm Hà Nội', 'Việc làm TP. HCM', 'Việc làm Cần Thơ', 'Việc làm Đà Nẵng',
    'Việc làm Hải Phòng', 'Việc làm Thanh Hóa', 'Việc làm Bình Dương', 'Việc làm Đông Nai',
    'Việc làm Tây Ninh', 'Việc làm Đà Lạt', 'Việc làm Gia Lai', 'Việc làm Nha Trang',
    'Việc làm Bà Rịa - Vũng Tàu', 'Việc làm Huế', 'Việc làm Gia sư tại Hà Nội',
    'Việc làm Lái xe tại Hà Nội', 'Việc làm Tài xế tại Cần Thơ', 'Việc làm Tài xế tại TP. HCM',
    'Việc làm Tài xế B2 tại TP. HCM', 'Việc làm Kế toán tại Hà Nội', 'Việc làm Kế toán tại TP. HCM',
    'Việc làm Kế toán tại Đà Nẵng', 'Việc làm Marketing tại Hà Nội', 'Việc làm Marketing tại TP. HCM',
    'Việc làm Marketing tại Đà Nẵng', 'Việc làm Ngân hàng tại Hà Nội', 'Việc làm Ngân hàng tại TP. HCM',
    'Việc làm Ngân hàng tại Đà Nẵng', 'Việc làm Nhân viên kinh doanh', 'Việc làm Marketing',
    'Việc làm Nhân viên Marketing', 'Việc làm Content Marketing', 'Việc làm Kế toán',
  ];

  const location = useLocation();

  if(location && location.pathname === '/register' || location.pathname === '/login') {
    return null;
  }
  return (
    <footer className="bg-white">
      {/* Job Links Section - Full Width */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="container max-w-6xl py-12">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {jobLinks.map((link, index) => (
              <Link key={index} to="#" className="text-slate-600 hover:underline transition">
                {link},
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid - Full Width */}
      <div className="bg-white border-y border-slate-200">
        <div className="container max-w-6xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">MNP</span>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Master New Potential
              </p>
              
              {/* Contact */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Liên hệ</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="font-medium">Hotline: <span className="text-slate-900">(024) 6680 5588</span></p>
                  <p className="font-medium">Email: <span className="text-slate-900">contact@mnp.vn</span></p>
                </div>
              </div>

              {/* Social */}
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 1 - Về MNP */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Về MNP</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <Link to="#" className="block hover:text-slate-900 transition">Giới thiệu</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Góc báo chí</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Tuyển dụng</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Liên hệ</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Hỏi đáp</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Chính sách bảo mật</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Điều khoản dịch vụ</Link>
              </div>
            </div>

            {/* Column 2 - Hỗ trợ & CV */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Hỗ trợ & CV</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <Link to="#" className="block hover:text-slate-900 transition">Quản lý CV của bạn</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Hướng dẫn viết CV</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Thu viên CV theo ngành nghề</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Review CV</Link>
                <h5 className="font-semibold text-slate-900 mt-4 mb-2">Khám phá</h5>
                <Link to="#" className="block hover:text-slate-900 transition">Ứng dụng di động MNP</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Tính lương Gross - Net</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Tính lãi suất kép</Link>
              </div>
            </div>

            {/* Column 3 - Xây dựng sự nghiệp */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Xây dựng sự nghiệp</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <Link to="#" className="block hover:text-slate-900 transition">Việc làm tốt nhất</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Việc làm lương cao</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Việc làm quản lý</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Việc làm IT</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Việc làm Senior</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Việc làm bán thời gian</Link>
                <h5 className="font-semibold text-slate-900 mt-4 mb-2">Quy tắc chung</h5>
                <Link to="#" className="block hover:text-slate-900 transition">Điều kiện giao dịch chung</Link>
                <Link to="#" className="block hover:text-slate-900 transition">Giá dịch vụ & Cách thanh toán</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white border-t border-slate-200">
        <div className="container py-6 text-center text-sm text-slate-600">
          © 2026 MNP - Nền tảng tuyển dụng hàng đầu Việt Nam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
