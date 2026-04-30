const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

let containerClient = null;

if (connectionString) {
	const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
	containerClient = blobServiceClient.getContainerClient(containerName);
}

/**
 * Upload a file buffer to Azure Blob Storage
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {string} mimeType 
 * @returns {Promise<string>} Public URL of the uploaded blob
 */
const uploadToAzure = async (fileBuffer, fileName, mimeType) => {
	if (!containerClient) {
		throw new Error("Azure Storage connection string is not configured.");
	}

	// Ensure container exists
	await containerClient.createIfNotExists({ access: "blob" });

	const blobName = `${Date.now()}-${fileName}`;
	const blockBlobClient = containerClient.getBlockBlobClient(blobName);

	await blockBlobClient.uploadData(fileBuffer, {
		blobHTTPHeaders: { blobContentType: mimeType },
	});

	return blockBlobClient.url;
};

/**
 * Delete a file from Azure Blob Storage
 * @param {string} fileUrl 
 */
const deleteFromAzure = async (fileUrl) => {
	if (!containerClient || !fileUrl) return;

	try {
		const urlParts = fileUrl.split("/");
		const blobName = urlParts[urlParts.length - 1];
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		await blockBlobClient.deleteIfExists();
	} catch (error) {
		console.error("Error deleting blob from Azure:", error);
	}
};

module.exports = {
	uploadToAzure,
	deleteFromAzure,
};
