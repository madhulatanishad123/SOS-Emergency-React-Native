import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, X, Shield, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your 24/7 Safety Assistant. How can I help you stay safe today?", sender: 'AI_ASSISTANT', time: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { text: inputText, sender: 'USER', time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/chat/message', { message: inputText });
      const aiMsg = { text: response.data.reply, sender: 'AI_ASSISTANT', time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { text: "I'm having trouble connecting right now. Please try again or press the SOS button if it's an emergency.", sender: 'AI_ASSISTANT', time: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', background: '#0a0a0c', color: 'white' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#ff3b30', padding: '10px', borderRadius: '12px' }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Safety Assistant</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }} />
            <span style={{ fontSize: '12px', color: '#a0a0a0' }}>Online & Active 24/7</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={index}
            style={{
              alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'USER' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              padding: '14px 18px',
              borderRadius: msg.sender === 'USER' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: msg.sender === 'USER' ? '#ff3b30' : 'rgba(255,255,255,0.05)',
              border: msg.sender === 'USER' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '5px' }}>
              {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '20px', display: 'flex', gap: '5px' }}>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b30' }} />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b30' }} />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b30' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your safety concern..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '15px 20px',
              color: 'white',
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#ff3b30',
              border: 'none',
              borderRadius: '16px',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={22} color="white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAssistant;
