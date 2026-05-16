import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Shield, AlertCircle, MapPin, ChevronLeft, Volume2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const userId = localStorage.getItem('userId') || '67c978000000000000000001'; // Fallback for demo

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/sos/history/${userId}`);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">SOS Evidence History</h1>
          <p className="text-gray-400 text-sm">Review your past emergency alerts and recordings</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#ff3b30]"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <Shield size={60} className="mx-auto mb-4" />
              <p>No emergency history found.</p>
            </div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#ff3b30]/10 p-3 rounded-2xl">
                      <AlertCircle className="text-[#ff3b30]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg uppercase tracking-wider">{item.triggerType} Trigger</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar size={14} />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    item.status === 'active' ? 'bg-[#ff3b30] text-white' : 'bg-green-500/20 text-green-500'
                  }`}>
                    {item.status}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                      <MapPin className="text-gray-400" size={20} />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Location Snapshot</p>
                        <p className="text-sm font-mono">{item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}</p>
                      </div>
                    </div>

                    {item.evidenceUrl ? (
                      <div className="bg-[#007aff]/10 border border-[#007aff]/20 p-4 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Volume2 size={18} className="text-[#007aff]" />
                            <span className="text-sm font-bold text-[#007aff]">Audio Evidence</span>
                          </div>
                          <a 
                            href={`http://localhost:5000${item.evidenceUrl}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] bg-[#007aff] px-2 py-1 rounded-md font-bold hover:bg-[#007aff]/80 transition-colors"
                          >
                            DOWNLOAD
                          </a>
                        </div>
                        <audio 
                          controls 
                          className="w-full h-8"
                          onPlay={() => setPlayingId(item._id)}
                        >
                          <source src={`http://localhost:5000${item.evidenceUrl}`} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <div className="bg-white/5 p-4 rounded-2xl text-center text-gray-500 text-sm">
                        No Evidence Recorded
                      </div>
                    )}
                  </div>

                  <div className="bg-black/40 rounded-2xl p-4 flex flex-col justify-center items-center border border-white/5">
                    <MapPin className="text-[#ff3b30] mb-2 opacity-50" />
                    <p className="text-[10px] text-gray-500 font-bold">MAP SNAPSHOT</p>
                    <p className="text-xs text-gray-400 text-center mt-1">Static map would be rendered here in production</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default History;
