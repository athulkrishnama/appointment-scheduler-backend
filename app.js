const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const origins = require('./constants/origins');
const authRoute = require('./routes/authRoute');
dotenv.config();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const allowedOrigins = [origins.client, origins.service, origins.admin];
app.use(cors({origin:allowedOrigins})); 


app.use('/auth', authRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
