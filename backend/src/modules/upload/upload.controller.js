import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      });
    }

    // Upload buffer to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "fabricflow_products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image to Cloudinary.",
            error: error.message,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Image uploaded successfully.",
          url: result.secure_url,
        });
      }
    );

    // End the stream with the file buffer
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during upload.",
    });
  }
};
