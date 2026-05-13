import db from "../models";
import { PayOS } from '@payos/node';
require("dotenv").config();

const payos = new PayOS({
	clientId: process.env.PAY_OS_CLIENT_ID,
	apiKey: process.env.PAY_OS_API_KEY,
	checksumKey: process.env.PAY_OS_CHECKSUM_KEY,
});

const createPaymentLink = async (userId, jobId, domain) => {
	try {
		// 1. Kiểm tra job có tồn tại không
		const job = await db.Job.findByPk(jobId);
		if (!job) {
			return { errCode: 1, errMessage: "Job not found" };
		}

		// 2. Tạo mã đơn hàng duy nhất (chỉ lấy số, tối đa 16 chữ số)
		const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(1000 + Math.random() * 9000));

		// 3. Lưu vào database
		await db.Transaction.create({
			userId: userId,
			jobId: jobId,
			amount: 50000,
			orderCode: orderCode,
			status: "PENDING",
		});

		// 4. Tạo body theo format của PayOS
		const body = {
			orderCode: orderCode,
			amount: 50000,
			description: `DAY TIN ${jobId}`,
			items: [
				{
					name: `Gói Đẩy tin VIP 7 ngày (Job: ${jobId})`,
					quantity: 1,
					price: 50000,
				},
			],
			returnUrl: `${domain}/employer/payment-result?payment=success&orderCode=${orderCode}`,
			cancelUrl: `${domain}/employer/payment-result?payment=cancel&orderCode=${orderCode}`,
		};

		const paymentLinkRes = await payos.paymentRequests.create(body);

		return {
			errCode: 0,
			errMessage: "Tạo link thanh toán thành công",
			data: paymentLinkRes.checkoutUrl,
		};
	} catch (error) {
		console.error("Error creating payment link:", error);
		return { errCode: -1, errMessage: "Lỗi từ server: " + error.message };
	}
};

const handleWebhook = async (webhookBody) => {
	try {
		// Xác thực chữ ký webhook từ PayOS
		const data = await payos.webhooks.verify(webhookBody);
		const webhookData = data.data ? data.data : data;
		if (data.code === "00" || data.success === true || webhookData.code === "00") {
			const orderCode = webhookData.orderCode;
			const transaction = await db.Transaction.findOne({
				where: { orderCode: orderCode },
			});

			if (transaction && transaction.status === "PENDING") {
				// Cập nhật trạng thái giao dịch
				await transaction.update({ status: "SUCCESS" });

				// Cập nhật ngày featured của Job
				const job = await db.Job.findByPk(transaction.jobId);
				if (job) {
					const now = new Date();
					let newDate = new Date();
					
					// Nếu job đang được nổi bật, cộng dồn thêm 7 ngày
					if (job.featuredUntil && new Date(job.featuredUntil) > now) {
						newDate = new Date(new Date(job.featuredUntil).getTime() + 7 * 24 * 60 * 60 * 1000);
					} else {
						newDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
					}
					
					await job.update({ featuredUntil: newDate });

					// Gửi thông báo cho nhà tuyển dụng
					await db.Notification.create({
						receiver_id: transaction.userId,
						type: "SYSTEM",
						content: `Thanh toán thành công 50,000đ. Tin tuyển dụng "${job.title}" đã được ghim lên vị trí nổi bật.`,
					});
				}
			}
		}
		return { errCode: 0, errMessage: "Webhook processed" };
	} catch (error) {
		console.error("Webhook processing error:", error);
		// Không ném lỗi ra ngoài để PayOS nhận HTTP 200 (webhook retry liên tục nếu lỗi)
		return { errCode: -1, errMessage: "Lỗi xử lý webhook" };
	}
};

const getAllTransactions = async () => {
    try {
        const transactions = await db.Transaction.findAll({
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: db.Job,
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return {
            errCode: 0,
            errMessage: "Lấy danh sách giao dịch thành công",
            data: transactions
        }
    } catch (error) {
        return { errCode: -1, errMessage: "Lỗi từ server" };
    }
}

module.exports = {
	createPaymentLink,
	handleWebhook,
    getAllTransactions
};
