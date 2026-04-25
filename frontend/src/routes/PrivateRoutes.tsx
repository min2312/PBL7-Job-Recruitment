import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const PrivateRoutes: React.FC = () => {
	const {user} = useAuth();
	return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
