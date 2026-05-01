// import { useState, useEffect } from 'react';
// import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

// export function AdminReports() {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);
//   return (
//     <>
//       <div className="mb-6">
//         <h1 className="font-heading text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
//           <BarChart3 className="w-8 h-8 text-primary" />
//           Báo cáo & Thống kê
//         </h1>
//         <p className="text-sm text-muted-foreground">Phân tích chi tiết và xu hướng dữ liệu hệ thống</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {[
//           { icon: TrendingUp, label: 'Tăng trưởng người dùng', value: '+12%', color: 'text-green-500' },
//           { icon: PieChart, label: 'Tỷ lệ ứng tuyển thành công', value: '64%', color: 'text-blue-500' },
//           { icon: Activity, label: 'Lượt truy cập hôm nay', value: '1,284', color: 'text-purple-500' },
//         ].map((item, i) => (
//           <div key={i} className="bg-card rounded-xl border border-border p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-2 rounded-lg bg-muted">
//                 <item.icon className="w-5 h-5 text-foreground" />
//               </div>
//               <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
//             </div>
//             <h4 className="text-sm text-muted-foreground font-medium">{item.label}</h4>
//           </div>
//         ))}
//       </div>

//       <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center text-center shadow-sm">
//         <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
//           <BarChart3 className="w-10 h-10 text-primary" />
//         </div>
//         <h2 className="text-2xl font-bold mb-3 text-foreground">Hệ thống phân tích đang được tối ưu</h2>
//         <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
//           Chúng tôi đang tích hợp dữ liệu thời gian thực để mang đến cho bạn cái nhìn sâu sắc nhất về thị trường tuyển dụng trên JobHub.
//         </p>
//         <div className="mt-8 flex gap-3">
//           <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
//           <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
//           <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
//         </div>
//       </div>
//     </>
//   );
// }
