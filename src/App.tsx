import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CouponList from './pages/CouponList';
import StoreDetail from './pages/StoreDetail';
import CouponDisplay from './pages/CouponDisplay';
import CompletionScreen from './pages/CompletionScreen';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coupons" element={<CouponList />} />
          <Route path="/store/:id" element={<StoreDetail />} />
          <Route path="/coupon/:id" element={<CouponDisplay />} />
          <Route path="/completion" element={<CompletionScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;