require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');



const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://satyamkumarthakur21062002_db_user:Satyam2002@cluster0.amu5lxl.mongodb.net/setupPrinter';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'https://printer-setup1-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(bodyParser.json());

app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
