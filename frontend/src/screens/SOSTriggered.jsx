import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOSTriggered = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // After alert is sent, move to tracking
      const timer = setTimeout(() => navigate('/tracking'), 2000);
      return () => clearTimeout(timer);
    }
  }, [countdown, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at center, #2c0a0a 0%, #0a0a0c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ marginBottom: '40px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '10px', justifyContent: 'center' }}>
          <AlertCircle size={24} />
          <h2 style={{ fontWeight: '800', letterSpacing: '1px' }}>SOS ACTIVATED</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Shake / Voice / Button Triggered</p>
      </motion.div>

      <div style={{ position: 'relative', width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)' }}
        />
        <div className="glow-button" style={{ 
          width: '180px', 
          height: '180px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: '900',
          zIndex: 2
        }}>
          {countdown > 0 ? countdown : 'SOS'}
        </div>
      </div>

      <p style={{ margin: '40px 0', fontSize: '18px', fontWeight: '500' }}>
        {countdown > 0 ? 'Sending Alert in...' : 'Sending Alert...'}
      </p>

      <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '400px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{
            flex: 1,
            padding: '18px',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          CANCEL
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{
            flex: 1,
            padding: '18px',
            borderRadius: '16px',
            background: 'var(--safe-green)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle size={20} />
          I'M SAFE
        </motion.button>
      </div>

      <div style={{ marginTop: '50px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Live location is being shared with 5 contacts
      </div>
    </div>
  );
};

export default SOSTriggered;
