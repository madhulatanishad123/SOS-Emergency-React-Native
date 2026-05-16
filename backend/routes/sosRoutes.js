const express = require('express');
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const twilio = require('twilio');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/evidence/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper function to send SMS
const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.includes('xxxx')) {
      console.log('Twilio not configured. Simulated SMS to:', to, 'Message:', message);
      return;
    }
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log('SMS sent to:', to);
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
  }
};

// Trigger SOS
router.post('/trigger', async (req, res) => {
  try {
    const { userId, location, triggerType, alertId, status } = req.body;
    
    let alert;
    if (alertId) {
      alert = await SOSAlert.findByIdAndUpdate(alertId, { location, status: 'active' }, { new: true });
    } else {
      alert = new SOSAlert({ userId, location, triggerType, status: status || 'active' });
      await alert.save();
    }

    // Only send SMS if the alert is ACTIVE (not pending)
    if (alert.status === 'active') {
      const user = await User.findById(userId);
      if (user && user.emergencyContacts && user.emergencyContacts.length > 0) {
        const trackingUrl = `http://10.99.59.142:5173/tracking/${userId}`;
        const message = `EMERGENCY ALERT! ${user.name.toUpperCase()} is in danger and has triggered SOS. Track live location here: ${trackingUrl}`;
        
        user.emergencyContacts.forEach(contact => {
          if (contact.phone) {
            sendSMS(contact.phone, message);
          }
        });
      }
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active alerts (for dashboard/police view)
router.get('/active', async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ status: 'active' }).populate('userId', 'name phone');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload SOS Evidence
router.post('/upload/:alertId', upload.single('evidence'), async (req, res) => {
  try {
    const { alertId } = req.params;
    const { base64, fileType } = req.body; // Support for base64 fallback

    let fileUrl;
    let evidenceType;

    if (req.file) {
      // Multipart upload
      fileUrl = `/uploads/evidence/${req.file.filename}`;
      evidenceType = req.file.mimetype.includes('video') ? 'video' : 'audio';
    } else if (base64) {
      // Base64 fallback
      const fs = require('fs');
      const extension = fileType === 'video' ? 'mp4' : 'm4a';
      const filename = `${Date.now()}-base64-upload.${extension}`;
      const filePath = path.join(__dirname, '../uploads/evidence/', filename);
      
      // Remove data:video/mp4;base64, prefix if present
      const base64Data = base64.split(',')[1] || base64;
      fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
      
      fileUrl = `/uploads/evidence/${filename}`;
      evidenceType = fileType;
    } else {
      return res.status(400).json({ message: 'No file uploaded' });
    }

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get User SOS History
router.get('/history/:userId', async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete SOS Alert
router.delete('/history/:alertId', async (req, res) => {
  try {
    await SOSAlert.findByIdAndDelete(req.params.alertId);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Heatmap Data (Danger Zones & Safe Havens)
router.get('/heatmap', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    // Validate that we have actual numbers
    const hasValidCoords = userLat !== null && !isNaN(userLat) && userLng !== null && !isNaN(userLng);

    // 1. Get recent active/past alerts for "Danger Zones"
    const recentAlerts = await SOSAlert.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).limit(50);

    let dangerZones = recentAlerts.map((alert, index) => ({
      latitude: alert.location.lat,
      longitude: alert.location.lng,
      weight: 1,
      type: index % 3 === 0 ? 'medium' : 'danger'
    }));

    // If user location is provided, add some dynamic danger zones nearby for realism
    if (hasValidCoords) {
      const dynamicDanger = [
        { latitude: userLat + 0.005, longitude: userLng + 0.005, type: 'danger', name: 'High Crime Area' },
        { latitude: userLat - 0.008, longitude: userLng + 0.003, type: 'medium', name: 'Poorly Lit Street' }
      ];
      dangerZones = [...dangerZones, ...dynamicDanger];
    }

    // 2. Safe Havens
    let safeHavens = [
      { latitude: 12.9716, longitude: 77.5946, name: 'Central Police Station', type: 'police', phone: '100' },
      { latitude: 12.9279, longitude: 77.6271, name: 'St. John\'s Hospital', type: 'hospital', phone: '080-22065000' },
      { latitude: 28.6139, longitude: 77.2090, name: 'Delhi Safe Zone', type: 'police', phone: '112' }
    ];

    // If user location is provided, generate real "nearby" places
    if (hasValidCoords) {
      const nearbyHavens = [
        { latitude: userLat + 0.002, longitude: userLng + 0.001, name: 'Local Police Outpost', type: 'police', phone: '100' },
        { latitude: userLat - 0.003, longitude: userLng - 0.002, name: 'City Emergency Care', type: 'hospital', phone: '102' },
        { latitude: userLat + 0.004, longitude: userLng - 0.004, name: 'Safe Stay Hotel', type: 'hotel', phone: '080-11223344' },
        { latitude: userLat - 0.001, longitude: userLng + 0.005, name: 'Community Help Center', type: 'help_center', phone: '1091' },
        { latitude: userLat + 0.006, longitude: userLng + 0.002, name: 'Metro Station North', type: 'metro', phone: '' }
      ];
      safeHavens = [...safeHavens, ...nearbyHavens];
    }

    res.json({
      dangerZones,
      safeHavens
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
