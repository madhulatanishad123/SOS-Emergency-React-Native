import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import SOSTriggered from './screens/SOSTriggered';
import LiveTracking from './screens/LiveTracking';
import SafetyTips from './screens/SafetyTips';
import NearbyStations from './screens/NearbyStations';
import LoginScreen from './screens/LoginScreen';
import FakeCall from './screens/FakeCall';
import History from './screens/History';
import ChatAssistant from './screens/ChatAssistant';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/sos-active" element={<SOSTriggered />} />
          <Route path="/tracking/:userId" element={<LiveTracking />} />
          <Route path="/safety-tips" element={<SafetyTips />} />
          <Route path="/police" element={<NearbyStations />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/fake-call" element={<FakeCall />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<ChatAssistant />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
