// Mock data extracted from SQL dump for the job recruitment platform

export interface Category {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
  logo: string;
  description?: string;
  website?: string;
  employees?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Job {
  id: number;
  companyId: number;
  title: string;
  salary: string;
  level: string;
  experience: string;
  education: string;
  employmentType: string;
  quantity: number;
  description: string;
  requirement: string;
  benefit: string;
  workLocation: string;
  workTime: string;
  createdAt: string;
  categoryIds: number[];
  locationIds: number[];
}

export interface Application {
  id: number;
  userId: number;
  jobId: number;
  cvFile?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
  phone?: string;
  companyId?: number;
}

export const categories: Category[] = [
  { id: 1, name: 'Bán lẻ - Hàng tiêu dùng - FMCG' },
  { id: 2, name: 'Nông Lâm Ngư nghiệp' },
  { id: 3, name: 'Xây dựng' },
  { id: 4, name: 'Sản xuất' },
  { id: 5, name: 'Nhà hàng / Khách sạn' },
  { id: 6, name: 'Xuất nhập khẩu' },
  { id: 7, name: 'Thời trang' },
  { id: 8, name: 'Giáo dục / Đào tạo' },
  { id: 9, name: 'IT - Phần mềm' },
  { id: 10, name: 'Tư vấn' },
  { id: 11, name: 'Khác' },
  { id: 12, name: 'Logistics - Vận tải' },
  { id: 13, name: 'Thương mại điện tử' },
  { id: 14, name: 'Ngân hàng' },
  { id: 15, name: 'Tài chính' },
  { id: 16, name: 'Tự động hóa' },
  { id: 17, name: 'Bảo trì / Sửa chữa' },
  { id: 18, name: 'Thương mại tổng hợp' },
  { id: 19, name: 'Bất động sản' },
  { id: 20, name: 'Marketing / Truyền thông / Quảng cáo' },
  { id: 21, name: 'Dược phẩm / Y tế / Công nghệ sinh học' },
  { id: 22, name: 'IT - Phần cứng' },
  { id: 23, name: 'Cơ khí' },
  { id: 24, name: 'Điện tử / Điện lạnh' },
  { id: 25, name: 'Viễn thông' },
  { id: 26, name: 'Giải trí' },
  { id: 27, name: 'Năng lượng' },
  { id: 28, name: 'Du lịch' },
  { id: 29, name: 'Thiết kế / kiến trúc' },
  { id: 30, name: 'In ấn / Xuất bản' },
  { id: 31, name: 'Luật' },
  { id: 32, name: 'Nhân sự' },
  { id: 33, name: 'Internet / Online' },
  { id: 34, name: 'Môi trường' },
  { id: 35, name: 'Chứng khoán' },
  { id: 36, name: 'Bảo hiểm' },
  { id: 37, name: 'Agency (Design/Development)' },
  { id: 38, name: 'Agency (Marketing/Advertising)' },
  { id: 39, name: 'Kế toán / Kiểm toán' },
  { id: 40, name: 'Tổ chức phi lợi nhuận' },
  { id: 41, name: 'Cơ quan nhà nước' },
];

export const locations: Location[] = [
  { id: 1, name: 'Hà Nam' },
  { id: 2, name: 'Ninh Bình' },
  { id: 3, name: 'Hồ Chí Minh' },
  { id: 4, name: 'Hà Nội' },
  { id: 5, name: 'Đà Nẵng' },
  { id: 6, name: 'Hưng Yên' },
  { id: 7, name: 'Thanh Hóa' },
  { id: 8, name: 'Bắc Ninh' },
  { id: 9, name: 'Hải Dương' },
  { id: 10, name: 'Hải Phòng' },
  { id: 11, name: 'Bắc Giang' },
  { id: 50, name: 'Đồng Nai' },
  { id: 55, name: 'Bình Dương' },
  { id: 56, name: 'Bà Rịa-Vũng Tàu' },
  { id: 75, name: 'Cần Thơ' },
];

export const companies: Company[] = [
  { 
    id: 1, 
    name: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN TLC VIỆT NAM', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/69159935ab9461763023157.png',
    website: 'https://tlc.vn',
    employees: '100-499 nhân viên',
    address: 'Ninh Bình - KCN Châu Sơn',
    phone: '0227.123456',
    email: 'hr@tlc.vn',
    description: 'Với mục tiêu kết nối nhân tài với cơ hội việc làm tốt nhất, chúng tôi đã phục vụ hàng ngàn ứng viên và nhà tuyển dụng. CÔNG TY CỔ PHẦN TẬP ĐOÀN TLC là nhà lãnh đạo trong ngành công nghiệp điện tử và sản xuất. Chúng tôi cung cấp các giải pháp tuyên dụng hàng đầu với đội ngũ chuyên gia giàu kinh nghiệm.'
  },
  { 
    id: 2, 
    name: 'CÔNG TY CỔ PHẦN QUỐC TẾ CUỘC SỐNG VIỆT', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/cong-ty-co-phan-quoc-te-cuoc-song-viet-63992dd6c32d7.jpg',
    website: 'https://qlvn.com.vn',
    employees: '50-99 nhân viên',
    address: 'Hồ Chí Minh - Phường Linh Xuân',
    phone: '0283.123456',
    email: 'recruit@qlvn.com.vn',
    description: 'Công ty chuyên về kinh doanh nông sản và xuất nhập khẩu. Chúng tôi cam kết mang lại các sản phẩm chất lượng cao cho khách hàng trong nước và quốc tế, với đội ngũ nhân viên chuyên nghiệp và tận tâm.'
  },
  { 
    id: 3, 
    name: 'CÔNG TY TNHH NHÔM KÍNH QUỐC ANH', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/eTcP2MYIUJyg4g1taIMSJlQsiufVXU0W_1743471985____29eac3ed1a097f1fa3d0f09ca478db7a.jpg',
    website: 'https://quocanh.vn',
    employees: '100-199 nhân viên',
    address: 'Hồ Chí Minh - Quận 9',
    phone: '0289.123456',
    email: 'jobs@quocanh.vn',
    description: 'Với kinh nghiệm hơn 10 năm trong ngành, chúng tôi cung cấp các giải pháp nhôm kính chất lượng cao, từ thiết kế, sản xuất đến thi công. Đội ngũ kỹ thuật viên lành nghề sẵn sàng phục vụ khách hàng.'
  },
  { 
    id: 4, 
    name: 'Công Ty TNHH Sản Xuất TM DV ITALIO', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/2bBxVApK6caFKGbqCCLyODWHeSzbcdys_1749194490____508e8f0770865cded62edc576f659b94.jpg',
    website: 'https://italio.vn',
    employees: '200-499 nhân viên',
    address: 'Hà Nội - Nam Từ Liêm',
    phone: '0243.123456',
    email: 'hr@italio.vn',
    description: 'ITALIO là công ty sản xuất và thương mại các sản phẩm công nghiệp chất lượng cao, phục vụ thị trường nội địa và xuất khẩu. Chúng tôi tích cực tuyên dụng những nhân viên giỏi để phát triển công ty.'
  },
  { 
    id: 5, 
    name: 'CÔNG TY TNHH MIRI HOLDINGS', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/hqewKltOzFD9u3pRNJDi21pVDk6I4bdM_1751951772____b67193a07ca26f50b803c369074569ca.png',
    website: 'https://miriholdings.vn',
    employees: '500+ nhân viên',
    address: 'Hồ Chí Minh - Quận 1',
    phone: '0288.123456',
    email: 'careers@miriholdings.vn',
    description: 'MIRI Holdings là tập đoàn đa ngành kinh doanh với các hoạt động trong lĩnh vực nhà hàng, khách sạn, du lịch và dịch vụ. Với môi trường làm việc chuyên nghiệp, chúng tôi tìm kiếm những nhân sự có tinh thần trách nhiệm cao.'
  },
  { 
    id: 8, 
    name: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ & SÁNG TẠO TRẺ TEKY', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/cong-ty-co-phan-cong-nghe-sang-tao-tre-teky-holdings-6297130b27e96.jpg',
    website: 'https://teky.vn',
    employees: '100-299 nhân viên',
    address: 'Hà Nội - Cầu Giấy',
    phone: '0224.123456',
    email: 'hr@teky.vn',
    description: 'TEKY là một trong những công ty tiên phong trong lĩnh vực đào tạo công nghệ cho trẻ em tại Việt Nam. Chúng tôi tạo môi trường sáng tạo, khuyến khích đổi mới và phát triển kỹ năng của từng thành viên trong tập thể.'
  },
  { 
    id: 18, 
    name: 'Công ty Cổ phần MISA', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/YVVFSY05ZUhqjlVHtBl2kOD1a189WFj0_1652947920____d78c5dd2ab820dcbb9a367b40e712067.jpg',
    website: 'https://misa.vn',
    employees: '500+ nhân viên',
    address: 'Hà Nội - Phạm Văn Bạch',
    phone: '0243.654321',
    email: 'careers@misa.vn',
    description: 'MISA là công ty hàng đầu trong lĩnh vực phần mềm quản trị doanh nghiệp tại Việt Nam. Với công nghệ tiên tiến và đội ngũ chuyên gia giỏi, chúng tôi cung cấp các giải pháp ERP, CRM, HRM toàn diện cho doanh nghiệp. Chúng tôi luôn tìm kiếm những tài năng CNTT để gia nhập đội ngũ.'
  },
  { 
    id: 47, 
    name: 'Trung Tâm Anh Ngữ ILA', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/trung-tam-anh-ngu-ila-57bfa5cf4cf23_rs.jpg',
    website: 'https://ilavietnam.vn',
    employees: '50-99 nhân viên',
    address: 'Hồ Chí Minh - Quận 1',
    phone: '0283.654321',
    email: 'jobs@ilavietnam.vn',
    description: 'ILA là một trung tâm anh ngữ quốc tế với kinh nghiệm giáo dục tiếng Anh hơn 20 năm. Chúng tôi cung cấp các khóa học tiếng Anh đa dạng và chất lượng cao. Nếu bạn đam mê giáo dục và có kỹ năng giao tiếp tốt, hãy gia nhập đội ngũ của chúng tôi.'
  },
  { 
    id: 53, 
    name: 'SHBFinance', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/Yeayjqzb9trIIi8az0dQFohw4tHAs5Hw_1651662182____f1a9a5bf90ccc65572d96cbe20efe520.jfif',
    website: 'https://shbfinance.vn',
    employees: '100-299 nhân viên',
    address: 'Hà Nội - Nhiều chi nhánh',
    phone: '0243.987654',
    email: 'hr@shbfinance.vn',
    description: 'SHBFinance là công ty cung cấp các dịch vụ tài chính và tín dụng đỉnh cao. Chúng tôi mang lại các giải pháp tài chính toàn diện và dịch vụ khách hàng xuất sắc. Tham gia vào đội ngũ chuyên nghiệp và năng động của chúng tôi.'
  },
  { 
    id: 100, 
    name: 'Ngân hàng TMCP Đông Nam Á - SEABANK', 
    logo: 'https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/company_logos/4XhudLFrcBny3dlsD9Mn7SetP50YWkv3_1711512611____54b244854e45defa1604a6104a045c24.png',
    website: 'https://seabank.com.vn',
    employees: '1000+ nhân viên',
    address: 'Hồ Chí Minh - Quận 3',
    phone: '0288.987654',
    email: 'careers@seabank.com.vn',
    description: 'Ngân hàng TMCP Đông Nam Á (SeABank) là một trong những ngân hàng hàng đầu tại Việt Nam, cung cấp các dịch vụ ngân hàng toàn diện từ tài khoản tiết kiệm, cho vay, thanh toán đến quản lý tài sản. Chúng tôi cam kết xây dựng môi trường làm việc chuyên nghiệp, tạo cơ hội phát triển sự nghiệp cho mỗi nhân viên.'
  },
];

export const jobs: Job[] = [
  {
    id: 1, companyId: 1, title: 'Trưởng Phòng R&D', salary: '25 - 40 triệu', level: 'Trưởng/Phó phòng',
    experience: '2 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 1,
    description: 'Thực hiện thử nghiệm, kiểm tra chất lượng, hiệu suất và độ an toàn của các sản phẩm đèn LED. Phối hợp với bộ phận thiết kế, sản xuất và QC để tối ưu hóa sản phẩm.',
    requirement: 'Ít nhất 1 năm nghiên cứu sản phẩm điện. Sử dụng phần mềm thiết kế 2D, 3D. Có khả năng làm việc độc lập.',
    benefit: 'Thu nhập 25-40 triệu. Lương tháng 13. BHXH, BHYT, BHTN. Môi trường chuyên nghiệp.',
    workLocation: 'Ninh Bình - KCN Châu Sơn', workTime: 'Thứ 2 - Thứ 7 (08:00 - 17:00)',
    createdAt: '2026-03-25', categoryIds: [1, 4], locationIds: [2],
  },
  {
    id: 2, companyId: 2, title: 'Nhân Viên Marketing – Kỹ Thuật (Ngành Nông Nghiệp)', salary: 'Thoả thuận', level: 'Nhân viên',
    experience: '2 năm', education: 'Cao Đẳng trở lên', employmentType: 'Toàn thời gian', quantity: 1,
    description: 'Xây dựng nội dung cho các kênh Facebook, Website, Zalo, TikTok. Tham gia tổ chức hội thảo nông dân, trình diễn sản phẩm.',
    requirement: 'Tốt nghiệp CĐ/ĐH ngành Marketing hoặc Nông nghiệp. Ít nhất 2 năm kinh nghiệm content.',
    benefit: 'Thu nhập thỏa thuận. BHXH, BHYT, BHTN. Lương tháng 13. Du lịch hàng năm.',
    workLocation: 'Hồ Chí Minh - Phường Linh Xuân', workTime: 'Thứ 2 - Thứ 7 (07:30 - 17:00)',
    createdAt: '2026-03-25', categoryIds: [2, 20], locationIds: [3],
  },
  {
    id: 3, companyId: 3, title: 'Kỹ Thuật Viên Công Trình Nhôm Kính', salary: '15 - 20 triệu', level: 'Nhân viên',
    experience: 'Dưới 1 năm', education: 'Cao Đẳng trở lên', employmentType: 'Toàn thời gian', quantity: 1,
    description: 'Khảo sát, đo đạc hiện trạng thực tế công trình. Đọc bản vẽ kỹ thuật, bóc tách khối lượng báo giá.',
    requirement: 'Thành thạo AutoCad. Kinh nghiệm 6 tháng ngành nhôm kính, thiết kế, nội thất.',
    benefit: 'Thu nhập 15-20 triệu + KPI. BHXH, BHYT. Thưởng lễ tết.',
    workLocation: 'Hồ Chí Minh - Quận 9', workTime: 'Thứ 2 - Thứ 7 (08:00 - 17:00)',
    createdAt: '2026-03-24', categoryIds: [3, 29], locationIds: [3],
  },
  {
    id: 4, companyId: 4, title: 'Nhân Viên Kinh Doanh - Từ 2 Năm Kinh Nghiệm', salary: 'Thoả thuận', level: 'Nhân viên',
    experience: '2 năm', education: 'Cao Đẳng trở lên', employmentType: 'Toàn thời gian', quantity: 2,
    description: 'Tư vấn, chăm sóc khách hàng. Hỗ trợ khách hàng trước, trong và sau bán. Theo dõi doanh số, báo cáo KPI.',
    requirement: 'Có kinh nghiệm kinh doanh. Kỹ năng giao tiếp tốt. Năng động, chủ động.',
    benefit: 'Lương cứng 7.5-10 triệu + hoa hồng. BHXH. Lương tháng 13.',
    workLocation: 'Hà Nội - Nam Từ Liêm', workTime: 'Thứ 2 - Thứ 7 (07:30 - 16:30)',
    createdAt: '2026-03-24', categoryIds: [1, 18], locationIds: [4],
  },
  {
    id: 5, companyId: 5, title: 'Restaurant Manager (Thu Nhập Hấp Dẫn)', salary: 'Thoả thuận', level: 'Trưởng chi nhánh',
    experience: '2 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 1,
    description: 'Lead the service and kitchen teams. Maintain service flow, cleanliness and execution standards. Track daily sales and required operating figures.',
    requirement: 'Experience at Supervisor or Restaurant Manager level in F&B. Strong leadership. Fluent in English.',
    benefit: 'Competitive salary, monthly bonus, tips. Annual leave, 13th-month bonus. Career growth opportunities.',
    workLocation: 'Đà Nẵng - 199 Nguyễn Văn Thoại', workTime: 'Theo lịch phân công',
    createdAt: '2026-03-23', categoryIds: [5], locationIds: [5],
  },
  {
    id: 6, companyId: 8, title: 'Lập Trình Viên Frontend React', salary: '18 - 30 triệu', level: 'Nhân viên',
    experience: '1 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 3,
    description: 'Phát triển giao diện web sử dụng React, TypeScript. Tối ưu hiệu suất ứng dụng. Phối hợp với Backend team.',
    requirement: 'Thành thạo React, TypeScript, CSS. Hiểu biết về REST API, Git.',
    benefit: 'Lương cạnh tranh 18-30 triệu. Laptop công ty. Work from home 2 ngày/tuần.',
    workLocation: 'Hà Nội - Cầu Giấy', workTime: 'Thứ 2 - Thứ 6 (09:00 - 18:00)',
    createdAt: '2026-03-25', categoryIds: [9, 33], locationIds: [4],
  },
  {
    id: 7, companyId: 18, title: 'Kế Toán Tổng Hợp', salary: '12 - 18 triệu', level: 'Nhân viên',
    experience: '2 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 1,
    description: 'Quản lý sổ sách kế toán tổng hợp. Lập báo cáo tài chính. Phối hợp kiểm toán.',
    requirement: 'Tốt nghiệp Đại học chuyên ngành Kế toán. Thành thạo phần mềm kế toán.',
    benefit: 'Lương 12-18 triệu. BHXH đầy đủ. Lương tháng 13. Du lịch công ty.',
    workLocation: 'Hà Nội - Phạm Văn Bạch', workTime: 'Thứ 2 - Thứ 6 (08:00 - 17:30)',
    createdAt: '2026-03-22', categoryIds: [39, 15], locationIds: [4],
  },
  {
    id: 8, companyId: 47, title: 'Giáo Viên Tiếng Anh', salary: '15 - 25 triệu', level: 'Nhân viên',
    experience: '1 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 5,
    description: 'Giảng dạy tiếng Anh cho học viên. Xây dựng giáo án và tài liệu. Theo dõi tiến độ học tập.',
    requirement: 'IELTS 7.0+ hoặc tương đương. Kỹ năng sư phạm tốt. Yêu thích giáo dục.',
    benefit: 'Lương 15-25 triệu. Đào tạo chuyên nghiệp. Cơ hội phát triển.',
    workLocation: 'Hồ Chí Minh - Quận 1', workTime: 'Thứ 2 - Thứ 7 (linh hoạt)',
    createdAt: '2026-03-25', categoryIds: [8], locationIds: [3],
  },
  {
    id: 9, companyId: 53, title: 'Chuyên Viên Tín Dụng', salary: '12 - 20 triệu', level: 'Nhân viên',
    experience: '1 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 10,
    description: 'Tiếp nhận và xử lý hồ sơ vay. Thẩm định khách hàng. Quản lý danh mục cho vay.',
    requirement: 'Tốt nghiệp ĐH chuyên ngành Tài chính/Ngân hàng. Kỹ năng phân tích.',
    benefit: 'Lương cạnh tranh + thưởng KPI. Bảo hiểm sức khỏe cao cấp.',
    workLocation: 'Hà Nội - Nhiều chi nhánh', workTime: 'Thứ 2 - Thứ 6 (08:00 - 17:00)',
    createdAt: '2026-03-24', categoryIds: [14, 15], locationIds: [4],
  },
  {
    id: 10, companyId: 100, title: 'Digital Marketing Manager', salary: '20 - 35 triệu', level: 'Trưởng/Phó phòng',
    experience: '3 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 1,
    description: 'Xây dựng chiến lược Digital Marketing. Quản lý ngân sách quảng cáo. Phân tích và báo cáo hiệu quả.',
    requirement: '3+ năm kinh nghiệm Digital Marketing. Thành thạo Google Ads, Facebook Ads. Tư duy data-driven.',
    benefit: 'Lương 20-35 triệu + bonus. Môi trường quốc tế. Laptop riêng.',
    workLocation: 'Hồ Chí Minh - Quận 3', workTime: 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
    createdAt: '2026-03-25', categoryIds: [20, 33], locationIds: [3],
  },
  {
    id: 11, companyId: 1, title: 'Nhân Viên QC - Kiểm Tra Chất Lượng', salary: '10 - 15 triệu', level: 'Nhân viên',
    experience: '1 năm', education: 'Cao Đẳng trở lên', employmentType: 'Toàn thời gian', quantity: 2,
    description: 'Kiểm tra chất lượng sản phẩm đèn LED. Lập báo cáo kiểm tra. Phối hợp với bộ phận sản xuất.',
    requirement: 'Kinh nghiệm QC/QA 1 năm. Cẩn thận, tỉ mỉ. Biết sử dụng dụng cụ đo.',
    benefit: 'Lương 10-15 triệu. BHXH đầy đủ. Ăn trưa miễn phí.',
    workLocation: 'Ninh Bình - KCN Châu Sơn', workTime: 'Thứ 2 - Thứ 6 (08:00 - 17:00)',
    createdAt: '2026-03-23', categoryIds: [4], locationIds: [2],
  },
  {
    id: 12, companyId: 18, title: 'Lập Trình Viên Backend .NET', salary: '20 - 35 triệu', level: 'Nhân viên',
    experience: '2 năm', education: 'Đại Học trở lên', employmentType: 'Toàn thời gian', quantity: 2,
    description: 'Phát triển và bảo trì hệ thống backend. Thiết kế database. Viết API phục vụ sản phẩm.',
    requirement: '2+ năm kinh nghiệm .NET/C#. Thành thạo SQL Server. Hiểu biết CI/CD.',
    benefit: 'Lương 20-35 triệu. Review lương 2 lần/năm. Đào tạo kỹ năng.',
    workLocation: 'Hà Nội - Phạm Văn Bạch', workTime: 'Thứ 2 - Thứ 6 (08:00 - 17:30)',
    createdAt: '2026-03-25', categoryIds: [9], locationIds: [4],
  },
];

// Mock applications
export const applications: Application[] = [
  { id: 1, userId: 1, jobId: 6, status: 'pending', createdAt: '2026-03-25', cvFile: 'cv_nguyen_van_a.pdf' },
  { id: 2, userId: 1, jobId: 7, status: 'approved', createdAt: '2026-03-24', cvFile: 'cv_nguyen_van_a.pdf' },
  { id: 3, userId: 2, jobId: 6, status: 'rejected', createdAt: '2026-03-23', cvFile: 'cv_tran_thi_b.pdf' },
  { id: 4, userId: 3, jobId: 10, status: 'pending', createdAt: '2026-03-25', cvFile: 'cv_le_van_c.pdf' },
  { id: 5, userId: 2, jobId: 8, status: 'approved', createdAt: '2026-03-22', cvFile: 'cv_tran_thi_b.pdf' },
];

export const users: User[] = [
  { id: 1, email: 'ungvien@email.com', name: 'Nguyễn Văn A', role: 'CANDIDATE', phone: '0912345678' },
  { id: 2, email: 'ungvien2@email.com', name: 'Trần Thị B', role: 'CANDIDATE', phone: '0923456789' },
  { id: 3, email: 'ungvien3@email.com', name: 'Lê Văn C', role: 'CANDIDATE', phone: '0934567890' },
  { id: 10, email: 'nhatuyendung@email.com', name: 'Phạm Đức D', role: 'EMPLOYER', phone: '0901234567', companyId: 18 },
  { id: 99, email: 'admin@jobhub.vn', name: 'Admin', role: 'ADMIN' },
];

// Helper functions
export function getCompanyById(id: number): Company | undefined {
  return companies.find(c => c.id === id);
}

export function getCategoryById(id: number): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getLocationById(id: number): Location | undefined {
  return locations.find(l => l.id === id);
}

export function getJobsByCategory(categoryId: number): Job[] {
  return jobs.filter(j => j.categoryIds.includes(categoryId));
}

export function getJobsByLocation(locationId: number): Job[] {
  return jobs.filter(j => j.locationIds.includes(locationId));
}

// Analytics data for insights
export const insightData = {
  jobsByCategory: [
    { category: 'IT - Phần mềm', count: 520, percentage: 30 },
    { category: 'Marketing / Truyền thông', count: 280, percentage: 16 },
    { category: 'Tài chính / Ngân hàng', count: 210, percentage: 12 },
    { category: 'Sản xuất', count: 180, percentage: 10 },
    { category: 'Bán lẻ - FMCG', count: 150, percentage: 9 },
    { category: 'Giáo dục / Đào tạo', count: 130, percentage: 7 },
    { category: 'Xây dựng', count: 110, percentage: 6 },
    { category: 'Khác', count: 170, percentage: 10 },
  ],
  jobsByLocation: [
    { location: 'Hà Nội', count: 580, percentage: 35 },
    { location: 'Hồ Chí Minh', count: 520, percentage: 31 },
    { location: 'Đà Nẵng', count: 120, percentage: 7 },
    { location: 'Bình Dương', count: 95, percentage: 6 },
    { location: 'Hải Phòng', count: 70, percentage: 4 },
    { location: 'Khác', count: 280, percentage: 17 },
  ],
  competitionRatio: [
    { category: 'Marketing / Truyền thông', ratio: 45, applicants: 12600, jobs: 280 },
    { category: 'IT - Phần mềm', ratio: 32, applicants: 16640, jobs: 520 },
    { category: 'Tài chính / Ngân hàng', ratio: 38, applicants: 7980, jobs: 210 },
    { category: 'Nhân sự', ratio: 42, applicants: 5040, jobs: 120 },
    { category: 'Kế toán / Kiểm toán', ratio: 35, applicants: 5250, jobs: 150 },
    { category: 'Bất động sản', ratio: 28, applicants: 3920, jobs: 140 },
  ],
  salaryByIndustry: [
    { category: 'IT - Phần mềm', min: 15, max: 40, avg: 25 },
    { category: 'Tài chính', min: 12, max: 35, avg: 20 },
    { category: 'Marketing', min: 10, max: 30, avg: 18 },
    { category: 'Sản xuất', min: 8, max: 25, avg: 14 },
    { category: 'Giáo dục', min: 10, max: 25, avg: 16 },
    { category: 'Xây dựng', min: 10, max: 30, avg: 17 },
  ],
  educationRequirements: [
    { level: 'Đại Học trở lên', percentage: 62 },
    { level: 'Cao Đẳng trở lên', percentage: 25 },
    { level: 'Trung cấp', percentage: 8 },
    { level: 'Không yêu cầu', percentage: 5 },
  ],
  experienceRequirements: [
    { level: 'Dưới 1 năm', percentage: 15 },
    { level: '1-2 năm', percentage: 35 },
    { level: '2-5 năm', percentage: 30 },
    { level: 'Trên 5 năm', percentage: 20 },
  ],
};
