const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sos_app');
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (Name: ${u.name})`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
