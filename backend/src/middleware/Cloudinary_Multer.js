const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

// Storage for Cloudinary (Images)
const imageStorage = new CloudinaryStorage({
	cloudinary,
	params: async (req, file) => {
		return {
			folder: "Job-Recruitment",
			resource_type: "image",
			allowed_formats: ["jpg", "png", "jpeg", "webp"],
		};
	},
});

// Multer instances
const uploadImage = multer({ storage: imageStorage });

// Generic Memory Storage for files that need custom processing (like Azure)
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ 
    storage: memoryStorage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for CVs
});

// Combined middleware for User Profile (Photo + CV)
// This will parse the multipart form. Fields: 'profilePicture' and 'cv_file'
const uploadUserFiles = uploadMemory.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]);

// Combined middleware for Company (Logo)
const uploadCompanyFiles = uploadMemory.fields([
    { name: 'logo', maxCount: 1 }
]);

// Middleware for Application (CV)
const uploadApplicationFiles = uploadMemory.fields([
    { name: 'cv_file', maxCount: 1 }
]);

module.exports = {
	cloudinary,
    uploadUserFiles,
    uploadCompanyFiles,
    uploadApplicationFiles,
    uploadImage, // backward compatibility if needed
};
