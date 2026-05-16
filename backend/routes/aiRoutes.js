const express = require('express');
const router = express.Router();
const SOSAlert = require('../models/SOSAlert');

// Calculate Real-time Safety Status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. Check for Active SOS Alerts
    const activeAlert = await SOSAlert.findOne({ userId, status: 'active' });
    if (activeAlert) {
      return res.json({
        status: 'DANGER',
        score: 95,
        reason: 'SOS Alert Triggered',
        color: '#ff3b30',
        recommendation: 'Emergency services notified. Stay in a visible area.'
      });
    }

    // 2. Time-based Risk Analysis
    const hour = new Date().getHours();
    let riskScore = 10; // Base score
    let reason = 'Safe environment';
    
    if (hour >= 22 || hour <= 4) {
      riskScore += 40;
      reason = 'High-risk time period (Late Night)';
    } else if (hour >= 18 || hour <= 21) {
      riskScore += 20;
      reason = 'Moderate-risk time period (Evening)';
    }

    // 3. Random Environmental Factors (Simulating Real AI)
    // In a real app, this would use crime data APIs, lighting data, etc.
    const randomFactor = Math.floor(Math.random() * 20);
    riskScore += randomFactor;

    let status = 'SAFE';
    let color = '#34c759';
    let recommendation = 'Your current environment appears safe.';

    if (riskScore > 60) {
      status = 'HIGH RISK';
      color = '#ff9500';
      recommendation = 'Consider sharing live tracking with a contact.';
    } else if (riskScore > 30) {
      status = 'CAUTION';
      color = '#ffcc00';
      recommendation = 'Stay alert and keep your phone accessible.';
    }

    res.json({
      status,
      score: riskScore,
      reason,
      color,
      recommendation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Proactive AI Check-In Analysis
router.get('/check-in/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const hour = new Date().getHours();
    const isNight = hour >= 22 || hour <= 4;
    
    // In a real app, we would compare current location with 'Home' from database
    // For now, we simulate a 'New Area' detection if the hour is late
    let needsCheckIn = false;
    let message = "";

    if (isNight) {
      needsCheckIn = true;
      message = "I noticed it's late and you're currently on the move. Would you like me to activate 'Guardian Mode' for the next 20 minutes?";
    } else if (hour >= 18 && Math.random() > 0.7) {
      // Occasional check-in during evening
      needsCheckIn = true;
      message = "The evening is setting in. Shall I share your current location with your emergency contacts just in case?";
    }

    res.json({
      needsCheckIn,
      message,
      type: isNight ? 'PROACTIVE_GUARD' : 'ROUTINE_CHECK',
      suggestedDuration: 20 // minutes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
