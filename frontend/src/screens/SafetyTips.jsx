import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, MapPin, Phone, Heart, Info, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SafetyTips = () => {
  const navigate = useNavigate();

  const tips = [
    {
      category: 'Awareness',
      items: [
        { title: 'Trust Your Instincts', desc: 'If something feels wrong, it probably is. Don\'t hesitate to leave.', icon: <Eye size={20} /> },
        { title: 'Stay Focused', desc: 'Keep your head up and eyes on your path. Avoid distractions.', icon: <Shield size={20} /> }
      ]
    },
    {
      category: 'Travel & Commute',
      items: [
        { title: 'Share Trip Details', desc: 'Always share your ride details with a trusted contact.', icon: <MapPin size={20} /> },
        { title: 'Public Areas', desc: 'Stay in well-lit, populated areas while waiting for transport.', icon: <Phone size={20} /> }
      ]
    },
    {
      category: 'Digital Safety',
      items: [
        { title: 'Location Privacy', desc: 'Avoid posting real-time locations on social media.', icon: <Shield size={20} /> },
        { title: 'Emergency Setup', desc: 'Ensure your phone\'s emergency SOS features are active.', icon: <Info size={20} /> }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', padding: '20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Safety Tips</h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ padding: '25px', marginBottom: '30px', textAlign: 'center', background: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.2)' }}
        >
          <Shield size={48} color="#ff3b30" style={{ marginBottom: '15px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px' }}>Empowerment through Awareness</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            Being prepared is the first step toward safety. Explore these essential tips to stay protected in any situation.
          </p>
        </motion.div>

        {tips.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '15px', paddingLeft: '10px' }}>
              {group.category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {group.items.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', cursor: 'default' }}
                >
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3b30' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 5px 0' }}>{item.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                  </div>
                  <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', textAlign: 'center', marginTop: '40px' }}>
          <Heart size={24} color="#ff2d55" style={{ marginBottom: '10px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Stay Safe, Stay Strong.</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
