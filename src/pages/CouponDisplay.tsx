import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { stores } from '../data/stores';

const CouponDisplay = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const store = stores.find(s => s.id === id);

  if (!store) {
    return <div>Coupon not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(`/store/${id}`)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold">Coupon</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{store.name}</h2>
          <p className="text-3xl font-bold text-red-600 mb-8">{store.discount}</p>

          {/* Dummy barcode */}
          <div className="bg-gray-900 w-64 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs">DUMMY BARCODE</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/completion')}
            className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold shadow-md hover:bg-green-700 transition-colors"
          >
            Complete Usage
          </button>
        </div>
      </main>
    </div>
  );
};

export default CouponDisplay;