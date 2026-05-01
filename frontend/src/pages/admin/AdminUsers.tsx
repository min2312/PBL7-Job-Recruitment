import { useState, useEffect } from 'react';
import { users as mockUsers } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Pencil, Users as UsersIcon } from 'lucide-react';

const PAGE_SIZE = 8;

export function AdminUsers() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [users, setUsers] = useState(
    mockUsers.map(u => ({ ...u, status: 'ACTIVE' }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any>(null);

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' ? true : u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleStatus = (id: number) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, status: u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE' }
          : u
      )
    );
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <UsersIcon className="w-8 h-8 text-primary" />
          Quản lý người dùng
        </h1>
        <p className="text-sm text-muted-foreground">
          Xem và quản lý tất cả tài khoản trong hệ thống JobHub
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 bg-muted/20">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 min-w-[240px] bg-background border border-border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-background border border-border px-3 py-2 rounded-lg text-sm focus:outline-none"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYER">Nhà tuyển dụng</option>
            <option value="CANDIDATE">Ứng viên</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-muted-foreground">Họ tên</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Email</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Vai trò</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Trạng thái</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/50 transition-colors group">
                  <td className="p-4 font-medium text-foreground">{u.name}</td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="font-normal">
                      {u.role === 'CANDIDATE' ? 'Ứng viên' : u.role === 'EMPLOYER' ? 'NTD' : 'Admin'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(u.id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.status === 'ACTIVE' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingUser(u)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-muted-foreground italic">
                    Không tìm thấy người dùng nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center gap-2 bg-muted/5">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                className="w-8 h-8 p-0"
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}