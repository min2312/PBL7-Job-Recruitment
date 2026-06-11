import { sendDailyInterviewReminders, handleExpiredInterviews } from "../service/cronService";
require("dotenv").config();

const run = async () => {
	try {
		console.log("--- Starting WebJob: Daily Interview Tasks at " + new Date().toISOString() + " ---");
		await sendDailyInterviewReminders();
		await handleExpiredInterviews();
		console.log("--- WebJob completed successfully ---");
		process.exit(0);
	} catch (error) {
		console.error("--- WebJob failed with error: ---", error);
		process.exit(1);
	}
};

run();
