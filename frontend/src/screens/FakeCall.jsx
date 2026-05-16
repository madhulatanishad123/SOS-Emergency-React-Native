import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FakeCall = () => {
  const [status, setStatus] = useState('incoming'); // incoming, active, ended
  const [seconds, setSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (status === 'active') {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0c', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '60px 20px 40px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--card-bg)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={60} color="var(--text-secondary)" />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Mom ❤️</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
          {status === 'incoming' ? 'Mobile' : status === 'active' ? formatTime(seconds) : 'Call Ended'}
        </p>
      </div>

      {status === 'incoming' && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <MessageSquare size={24} />
             </div>
             <span style={{ fontSize: '12px' }}>Message</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <PhoneOff size={24} />
             </div>
             <span style={{ fontSize: '12px' }}>Remind Me</span>
          </div>
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {status === 'incoming' ? (
          <>
            <motion.div 
              whileTap={{ scale: 0.9 }}
              onClick={() => { setStatus('ended'); setTimeout(() => navigate('/'), 1000); }}
              style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <PhoneOff size={30} color="white" style={{ transform: 'rotate(135deg)' }} />
            </motion.div>
            
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              onClick={() => setStatus('active')}
              style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Phone size={30} color="white" />
            </motion.div>
          </>
        ) : (
          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={() => { setStatus('ended'); setTimeout(() => navigate('/'), 1000); }}
            style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <PhoneOff size={30} color="white" style={{ transform: 'rotate(135deg)' }} />
          </motion.div>
        )}
      </div>

      <div style={{ height: '20px' }}></div>
    </div>
  );
};

export default FakeCall;
