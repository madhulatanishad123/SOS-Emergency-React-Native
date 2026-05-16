const express = require('express');
const router = express.Router();

// Safety Chatbot Logic
router.post('/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // In a real app, you would call an LLM API (like Gemini, OpenAI, etc.) here.
    // For this demo, we use a safety-focused intelligent response system.
    
    let response = "";
    const msg = message.toLowerCase();

    if (msg.includes('emergency') || msg.includes('help') || msg.includes('danger')) {
      response = "If you are in immediate danger, please press the RED SOS BUTTON now. I can also notify your emergency contacts for you. Are you safe right now?";
    } else if (msg.includes('walk') || msg.includes('night')) {
      response = "When walking at night, stay in well-lit areas and keep your phone in your hand. Would you like me to start a 'Timed Journey' monitor for you?";
    } else if (msg.includes('follow') || msg.includes('someone')) {
      response = "If you feel you're being followed, head towards a public place like a cafe or petrol station. Don't go home directly. Use the 'Fake Call' feature in this app to deter them.";
    } else if (msg.includes('contact') || msg.includes('family')) {
      response = "You can manage your emergency contacts in the 'Contacts' section. They will be notified instantly if you trigger an SOS.";
    } else if (msg.includes('tip') || msg.includes('advice')) {
      response = "My best safety tip: Always trust your intuition. If a situation feels wrong, it probably is. Check the 'Safety Tips' section for more detailed guides.";
    } else if (msg.includes('hello') || msg.includes('hi')) {
      response = "Hello! I am your SOS Safety Assistant. I'm here 24/7 to help you with safety advice, emergency procedures, or just to keep you company. How can I assist you today?";
    } else {
      response = "I understand. Your safety is my priority. Could you tell me more about your situation, or would you like to see some general safety tips?";
    }

    res.json({
      reply: response,
      timestamp: new Date(),
      sender: 'AI_ASSISTANT'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
