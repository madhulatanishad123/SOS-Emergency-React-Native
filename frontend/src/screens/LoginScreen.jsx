import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('userToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '40px' }}>
        <div style={{ background: 'var(--primary)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 30px var(--primary-glow)' }}>
          <Shield size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Sign in to stay protected</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', padding: '15px', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <Mail style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '18px 18px 18px 50px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '16px' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '18px 18px 18px 50px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '16px' }}
          />
        </div>

        <p style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Forgot Password?</p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: '700', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px var(--primary-glow)', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </form>

      <div style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Sign Up</span>
      </div>
    </div>
  );
};

export default LoginScreen;

