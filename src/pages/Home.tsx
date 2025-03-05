import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <QrCode className="w-24 h-24 mx-auto mb-8 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hotel Coupon Service
        </h1>
        <p className="text-gray-600 mb-8">
          Discover exclusive deals around your hotel
        </p>
        <button
          onClick={() => navigate('/coupons')}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
        >
          View Local Coupons
        </button>
      </div>
    </div>
  );
};

export default Home;