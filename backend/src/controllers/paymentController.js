import paymentService from "../service/paymentService";
require("dotenv").config();

const createPaymentLink = async (req, res) => {
	try {
		const userId = req.user.id; // Lấy từ token qua middleware checkUserJWT
		const { jobId } = req.body;
		
		// Lấy domain của frontend từ request origin hoặc config cứng
		const domain = process.env.CLIENT_URL || "http://localhost:3000";

		if (!jobId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Thiếu jobId",
			});
		}

		let response = await paymentService.createPaymentLink(userId, jobId, domain);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Lỗi từ server",
		});
	}
};

const handlePayOSWebhook = async (req, res) => {
	try {
		const webhookBody = req.body;
		
		// PayOS yêu cầu trả về status 200 và json có trường code để xác nhận đã nhận webhook
		let response = await paymentService.handleWebhook(webhookBody);
		
		return res.status(200).json({
			error: 0,
			message: "Ok",
			data: null
		});
	} catch (error) {
		console.log("Webhook Controller Error:", error);
		return res.status(200).json({
			error: 0,
			message: "Error processing webhook but acknowledged",
			data: null
		});
	}
};

const getAdminTransactions = async (req, res) => {
    try {
        let response = await paymentService.getAllTransactions();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: "Lỗi từ server",
        });
    }
}

module.exports = {
	createPaymentLink,
	handlePayOSWebhook,
    getAdminTransactions
};
