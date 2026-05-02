// import { useState, useEffect } from 'react';
// import { applications, jobs, users } from '@/data/mockData';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Eye, FileText, Calendar, User, Briefcase } from 'lucide-react';

// export function AdminApplications() {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);
//   return (
//     <>
//       <div className="mb-6">
//         <h1 className="font-heading text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
//           <FileText className="w-8 h-8 text-primary" />
//           Đơn ứng tuyển
//         </h1>
//         <p className="text-sm text-muted-foreground">Theo dõi tất cả lượt ứng tuyển từ người dùng trên hệ thống</p>
//       </div>

//       <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead className="bg-muted/50">
//               <tr>
//                 <th className="text-left p-4 font-semibold text-muted-foreground">Ứng viên</th>
//                 <th className="text-left p-4 font-semibold text-muted-foreground">Công việc</th>
//                 <th className="text-left p-4 font-semibold text-muted-foreground">Ngày nộp</th>
//                 <th className="text-left p-4 font-semibold text-muted-foreground">Trạng thái</th>
//                 <th className="text-right p-4 font-semibold text-muted-foreground">Hành động</th>
//               </tr>
//             </thead>
//             <tbody>
//               {applications.map(app => {
//                 const job = jobs.find(j => j.id === app.jobId);
//                 const user = users.find(u => u.id === app.candidateId);
//                 return (
//                   <tr key={app.id} className="border-t border-border hover:bg-muted/50 transition-colors group">
//                     <td className="p-4">
//                       <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                           <User className="w-4 h-4 text-primary" />
//                         </div>
//                         <span className="font-bold text-foreground">{user?.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-2 text-muted-foreground">
//                         <Briefcase className="w-3.5 h-3.5" />
//                         <span className="truncate max-w-[200px]">{job?.title}</span>
//                       </div>
//                     </td>
//                     <td className="p-4 text-muted-foreground">
//                       <div className="flex items-center gap-2">
//                         <Calendar className="w-3.5 h-3.5" />
//                         {app.appliedAt}
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <Badge 
//                         className={`rounded-full px-3 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${
//                           app.status === 'approved' 
//                             ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20' 
//                             : app.status === 'rejected' 
//                             ? 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20' 
//                             : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20'
//                         }`}
//                         variant="outline"
//                       >
//                         {app.status === 'approved' ? 'Đã duyệt' : app.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
//                       </Badge>
//                     </td>
//                     <td className="p-4 text-right">
//                       <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
//                         <Eye className="w-4 h-4" />
//                       </Button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// }
