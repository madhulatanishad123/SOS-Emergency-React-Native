import React from 'react';
import { ArrowLeft, Search, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NearbyStations = () => {
  const navigate = useNavigate();

  const havens = [
    { name: 'Connaught Place Police Station', type: 'Police', distance: '0.7 km', phone: '011-2334XXXX', color: '#007aff' },
    { name: 'City Hospital Emergency', type: 'Hospital', distance: '1.2 km', phone: '011-2338XXXX', color: '#ff3b30' },
    { name: '24/7 Safety Shop (Verified)', type: 'Safe Shop', distance: '1.8 km', phone: '011-2336XXXX', color: '#34c759' },
    { name: 'Parliament Street PS', type: 'Police', distance: '2.1 km', phone: '011-2345XXXX', color: '#007aff' }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'Police': return <Shield size={22} />;
      case 'Hospital': return <Heart size={22} />;
      case 'Safe Shop': return <MapPin size={22} />;
      default: return <MapPin size={22} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ArrowLeft onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Nearby Safe Havens</h1>
        </div>
        <Search size={22} color="var(--text-secondary)" />
      </header>

      {/* Map Placeholder Mini */}
      <div className="glass-card" style={{ height: '220px', marginBottom: '30px', position: 'relative', overflow: 'hidden', background: '#1a1a1c' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <MapPin size={40} color="#ff3b30" style={{ marginBottom: '10px' }} />
          <p style={{ opacity: 0.5, fontSize: '14px' }}>Detecting Nearby Help...</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {havens.map((haven, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}
          >
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${haven.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: haven.color }}>
                {getIcon(haven.type)}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>{haven.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: haven.color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', background: `${haven.color}10`, padding: '2px 8px', borderRadius: '4px' }}>
                    {haven.type}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{haven.distance}</span>
                </div>
              </div>
            </div>
            <motion.a
              href={`tel:${haven.phone}`}
              whileTap={{ scale: 0.9 }}
              style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}
            >
              <Phone size={18} color={haven.color} />
            </motion.a>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        style={{ width: '100%', marginTop: '30px', padding: '18px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '700' }}
      >
        VIEW ALL ON MAP
      </motion.button>
    </div>
  );
};

export default NearbyStations;
