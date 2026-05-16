const mongoose = require('mongoose');
require('dotenv').config();

async function fixEmails() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sos_app');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('Fixing existing emails...');
    for (const user of users) {
      const lowerEmail = user.email.toLowerCase().trim();
      if (user.email !== lowerEmail) {
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          { $set: { email: lowerEmail } }
        );
        console.log(`Updated: "${user.email}" -> "${lowerEmail}"`);
      }
    }
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixEmails();
