import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosClient from "@/services/axiosClient";

export default function PaymentResult() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const paymentStatus = searchParams.get("payment");
	const orderCode = searchParams.get("orderCode");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate("/employer/jobs");
        }
    }, [countdown, navigate]);

	useEffect(() => {
		if (paymentStatus === "cancel" && orderCode) {
			axiosClient.post("/api/payment/cancel", { orderCode }).catch(console.error);
		}
	}, [paymentStatus, orderCode]);

	if (paymentStatus === "success") {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
				<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
					<CheckCircle2 className="w-10 h-10 text-green-600" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
				<p className="text-gray-500 max-w-md mb-6">
					Cảm ơn bạn đã sử dụng dịch vụ. Tin tuyển dụng của bạn đã được nâng cấp VIP và sẽ được hiển thị ưu tiên trên hệ thống.
				</p>
				{orderCode && <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded mb-8">Mã đơn hàng: {orderCode}</p>}
				
				<div className="flex flex-col sm:flex-row gap-4">
					<Button asChild variant="outline">
						<Link to="/employer/jobs"><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại danh sách ({countdown}s)</Link>
					</Button>
				</div>
			</div>
		);
	}

	if (paymentStatus === "cancel") {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
				<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
					<AlertCircle className="w-10 h-10 text-red-600" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán đã bị hủy</h1>
				<p className="text-gray-500 max-w-md mb-8">
					Giao dịch thanh toán của bạn chưa được hoàn tất. Vui lòng thử lại sau nếu bạn vẫn muốn nâng cấp tin tuyển dụng.
				</p>
				
				<div className="flex flex-col sm:flex-row gap-4">
					<Button asChild>
						<Link to="/employer/jobs">Quay lại danh sách</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh]">
			<Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
			<p>Đang xử lý thông tin giao dịch...</p>
		</div>
	);
}
