// // Example: POST /api/upload
// import cloudinary from "cloudinary";

// cloudinary.v2.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_KEY,
//   api_secret: process.env.CLOUD_SECRET
// });

// export const uploadImage = async (req, res) => {
//   try {
//     const file = req.files.image.path;
//     const result = await cloudinary.v2.uploader.upload(file);
//     res.json({ url: result.secure_url });
//   } catch (err) {
//     res.status(500).json({ msg: "Upload failed" });
//   }
// };

// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_KEY,
//   api_secret: process.env.CLOUD_SECRET,
// });

// export default cloudinary;


import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export default cloudinary;


