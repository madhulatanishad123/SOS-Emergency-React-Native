import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Share2, StopCircle, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const LiveTracking = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [location, setLocation] = useState({ lat: 28.7041, lng: 77.1025 });
  const [userName, setUserName] = useState('User');
  const [status, setStatus] = useState('OFFLINE');
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to backend socket
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Connected to tracking server');
      setStatus('LISTENING');
    });

    socketRef.current.on('location_changed', (data) => {
      if (data.userId === userId) {
        setLocation({ lat: data.lat, lng: data.lng });
        setUserName(data.userName);
        setStatus('LIVE');
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [userId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'absolute', top: 0, width: '100%', zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
        <ArrowLeft onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>Live Tracking: {userName}</h1>
      </header>

      {/* Map Placeholder */}
      <div style={{ flex: 1, background: '#1a1a1c', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
          <MapPin size={60} color="var(--primary)" style={{ marginBottom: '15px' }} />
          <p>Live Map View</p>
          <p style={{ fontSize: '12px' }}>Tracking User ID: {userId}</p>
        </div>
        
        {/* Animated Marker */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', width: '25px', height: '25px', background: 'var(--primary)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 20px var(--primary)' }}
        />
        <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', padding: '5px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
           {userName}
        </div>
      </div>

      <div className="glass-card" style={{ margin: '20px', borderRadius: '24px', position: 'relative', bottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{userName}'s Location</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</p>
          </div>
          <div style={{ 
            background: status === 'LIVE' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)', 
            color: status === 'LIVE' ? 'var(--safe-green)' : '#ff3b30', 
            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', height: 'fit-content' 
          }}>
            {status}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
           <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="white" />
           </div>
           <div>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>{userName}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Emergency Contact: Alert Sent</p>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{ flex: 1, padding: '15px', borderRadius: '14px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            EXIT VIEW
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{ padding: '15px', borderRadius: '14px', background: 'var(--primary)', border: 'none', color: 'white' }}
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: 'Live Tracking', text: `Track ${userName}`, url });
              } else {
                alert('Tracking Link: ' + url);
              }
            }}
          >
            <Share2 size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
