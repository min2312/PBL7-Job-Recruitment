import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const PrivateRoutes: React.FC = () => {
	const { user, isAuthReady } = useAuth();

	if (!isAuthReady) {
		return <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm">Đang kiểm tra phiên đăng nhập...</span>
      </div>
    </div>;
	}

	return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
