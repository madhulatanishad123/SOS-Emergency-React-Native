const mongoose = require('mongoose');
const path = require('path');
const SOSAlert = require('./models/SOSAlert');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sos_app');
  const alerts = await SOSAlert.find().sort({ createdAt: -1 }).limit(5);
  console.log(JSON.stringify(alerts, null, 2));
  process.exit();
}
check();
