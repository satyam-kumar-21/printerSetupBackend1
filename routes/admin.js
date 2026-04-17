
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const { sendRegistrationEmail } = require('../utils/mailer');
// Registration endpoint: store form data and send email
router.post('/register', async (req, res) => {
  try {
    const { model, name, phone, email, agree } = req.body;
    if (!model || !name || !phone || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Save to DB
    const reg = new Registration({ model, name, phone, email, agree });
    await reg.save();
    // Send email
    await sendRegistrationEmail({ model, name, phone, email, agree });
    res.json({ success: true });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Failed to register and send email.' });
  }
});


const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

// Middleware for JWT authentication
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.username === ADMIN_USER) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// MongoDB setup
const { MongoClient } = require('mongodb');
const MONGO_URI = 'mongodb+srv://satyamkumarthakur21062002_db_user:Satyam2002@cluster0.amu5lxl.mongodb.net/setupPrinter';
const DB_NAME = 'setupPrinter';
const COLLECTION = 'settings';

// Global cache for MongoDB client
let cachedClient = null;
let cachedDb = null;

async function getMongoDb() {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }
  cachedClient = new MongoClient(MONGO_URI);
  await cachedClient.connect();
  cachedDb = cachedClient.db(DB_NAME);
  return cachedDb;
}

async function getSettings() {
  const db = await getMongoDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: 'global' });
  return doc || { showHeader: true, showLogo: true, allowModelSearch: true, showInstallationFailed: true, showCompleteSetup: true };
}

async function setSettings(settings) {
  const db = await getMongoDb();
  await db.collection(COLLECTION).updateOne(
    { _id: 'global' },
    { $set: settings },
    { upsert: true }
  );
}

// Get header and logo visibility
router.get('/header-visibility', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      showHeader: settings.showHeader,
      showLogo: settings.showLogo,
      allowModelSearch: settings.allowModelSearch,
      showInstallationFailed: typeof settings.showInstallationFailed === 'boolean' ? settings.showInstallationFailed : true,
      showCompleteSetup: typeof settings.showCompleteSetup === 'boolean' ? settings.showCompleteSetup : true
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load settings.' });
  }
});

// Set header and logo visibility (protected)
router.post('/header-visibility', adminAuth, async (req, res) => {
  const { showHeader, showLogo, allowModelSearch, showInstallationFailed, showCompleteSetup } = req.body;
  const settings = {
    showHeader: typeof showHeader === 'boolean' ? showHeader : true,
    showLogo: typeof showLogo === 'boolean' ? showLogo : true,
    allowModelSearch: typeof allowModelSearch === 'boolean' ? allowModelSearch : true,
    showInstallationFailed: typeof showInstallationFailed === 'boolean' ? showInstallationFailed : true,
    showCompleteSetup: typeof showCompleteSetup === 'boolean' ? showCompleteSetup : true
  };
  try {
    await setSettings(settings);
    res.json({ success: true, ...settings });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
});

// Admin login route (returns JWT if credentials are correct)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
