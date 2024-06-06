const express = require("express");
const { connectToDatabase } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const helmet = require("helmet");
const morgan = require("morgan");

const cloudinary = require('./config/cloudinary')

const userRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const ownerRoutes = require("./routes/owner");
const searchRoutes = require('./routes/search')
const universalRoutes = require('./routes/universal')

const swaggerSpec = require("./swagger");

const fileparser = require("./config/parseFile");
const upload = require("./middlewares/multer");

require("dotenv").config({ path: ".env" });

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "tmp/" }));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.set("json spaces", 5);

// app.post('/api/v1/upload', async (req, res) => {
//   console.log(req.files)
//   if(!req.files){
//     return res.status(400).json({
//       message: 'No file uploaded',
//       success: false,
//     })
//   }
//   const {image} = req.files;
//   if(!image){
//     return res.status(400).json({
//       message: 'No image uploaded',
//       success: false,
//     })
//   }
//   try {
//     const result = await cloudinary.uploader.upload(image.tempFilePath);
//     res.status(200).json({
//       message: 'Image uploaded successfully',
//       data: result
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Internal Server Error',
//       error: error.message
//     });
//   }
// });

app.get("/api/v1/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/owner", ownerRoutes);
app.use('/api/v1/search',searchRoutes);
app.use('/api/v1/universal',universalRoutes);

connectToDatabase();

app.use((req, res, next) => {
  const error = new Error('Endpoint not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
      message: 'Internal Server Error',
      error: err.message,
      success: false
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
