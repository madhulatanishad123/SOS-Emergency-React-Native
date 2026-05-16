import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Phone, Mic, Heart, AlertTriangle, Bell, User, Menu, X, LogOut, MapPin, Settings, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [aiStatus, setAiStatus] = useState({
    status: 'ANALYZING',
    color: '#a0a0a0',
    recommendation: 'AI is analyzing your environment...',
  });
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');

  const handleSOS = () => {
    navigate('/sos-active');
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchAIStatus(userId);
      const interval = setInterval(() => fetchAIStatus(userId), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchAIStatus = async (userId) => {
    try {
      // Assuming the backend is running on port 5000
      const response = await fetch(`http://localhost:5000/api/ai/status/${userId}`);
      const data = await response.json();
      setAiStatus(data);
    } catch (error) {
      console.error('Error fetching AI status:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: <AlertTriangle size={18} color="#ff3b30" />, label: 'Emergency SOS', path: '/sos-active' },
    { icon: <MapPin size={18} color="#007aff" />, label: 'Live Tracking', path: `/tracking/${localStorage.getItem('userId')}` },
    { icon: <Phone size={18} color="#34c759" />, label: 'Fake Call', path: '/fake-call' },
    { icon: <Shield size={18} color="#ff9500" />, label: 'Safety Check', path: '/safety-tips' },
    { icon: <Heart size={18} color="#ff2d55" />, label: 'Contacts', path: '/police' },
    { icon: <MessageSquare size={18} color="#007aff" />, label: 'AI Assistant', path: '/chat' },
    { icon: <Clock size={18} color="#007aff" />, label: 'SOS History', path: '/history' },
    { icon: <LogOut size={18} color="#a0a0a0" />, label: 'Sign Out', path: '/login' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Women Safety</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Hi, {userName} 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative' }}>
          <Bell size={24} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
          <div ref={menuRef}>
            <Menu 
              size={24} 
              color="white" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setMenuOpen(!menuOpen)} 
            />
            
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    width: '220px',
                    background: 'rgba(30, 30, 35, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '10px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>Navigation</span>
                    <X size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={() => setMenuOpen(false)} />
                  </div>
                  {menuItems.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      className="menu-item-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* SOS Button Section */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
        <motion.button
          className="glow-button sos-pulse"
          onClick={handleSOS}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '200px',
            height: '200px',
            fontSize: '32px',
            fontWeight: '900',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          SOS
          <span style={{ fontSize: '12px', fontWeight: '400', opacity: 0.8 }}>TAP TO ALERT</span>
        </motion.button>
      </div>

      {/* Grid Features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <FeatureCard 
          icon={<Phone size={24} color="#007aff" />} 
          label="Fake Call" 
          onClick={() => navigate('/fake-call')}
        />
        <FeatureCard 
          icon={<Mic size={24} color="#ff9500" />} 
          label="Voice SOS" 
          onClick={() => navigate('/sos-active')}
        />
        <FeatureCard 
          icon={<Shield size={24} color="#ff3b30" />} 
          label="Safety Tips" 
          onClick={() => navigate('/safety-tips')}
        />
        <FeatureCard 
          icon={<Heart size={24} color="#ff2d55" />} 
          label="My Contacts" 
          onClick={() => navigate('/police')}
        />
        <FeatureCard 
          icon={<MessageSquare size={24} color="#007aff" />} 
          label="AI Assistant" 
          onClick={() => navigate('/chat')}
        />
        <FeatureCard 
          icon={<Clock size={24} color="#007aff" />} 
          label="SOS History" 
          onClick={() => navigate('/history')}
        />
      </div>

      {/* AI Status */}
      <div className="glass-card" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '5px', padding: '15px 25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', background: aiStatus.color, borderRadius: '50%' }}></div>
          <span style={{ fontWeight: '700' }}>AI Status: {aiStatus.status}</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{aiStatus.recommendation}</p>
      </div>
    </div>
  );
};
    </div>
  );
};

const FeatureCard = ({ icon, label, onClick }) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="glass-card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '25px 15px',
      cursor: 'pointer'
    }}
  >
    {icon}
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
  </motion.div>
);

export default HomeScreen;
