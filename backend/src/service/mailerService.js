import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT) || 587,
	secure: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const sendEmail = async ({ to, subject, html }) => {
	const mailOptions = {
		from: `Master New Potential <${process.env.EMAIL_USER}>`,
		to,
		subject,
		html,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		return info;
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
};

export { sendEmail };
