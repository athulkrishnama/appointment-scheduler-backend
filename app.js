const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const origins = require("./constants/origins");
const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");
const servcieProviderRoute = require("./routes/serviceProviderRoute");
const clientRoute = require("./routes/clientRoute");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("./config/s3");
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

app.use(cookieParser());

const allowedOrigins = [origins.client, origins.service, origins.admin];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/client", clientRoute);
app.use("/serviceProvider", servcieProviderRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
