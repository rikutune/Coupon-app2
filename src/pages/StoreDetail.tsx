import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin } from 'lucide-react';
import { stores } from '../data/stores';

const StoreDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const store = stores.find(s => s.id === id);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => navigate('/coupons')}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-lg font-semibold">
            {store.discount}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-6">
          <MapPin className="w-5 h-5 mr-2" />
          <span>{store.location}</span>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Coupon Details</h2>
          <p className="text-gray-600">{store.description}</p>
        </div>

        <button
          onClick={() => navigate(`/coupon/${store.id}`)}
          className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
        >
          Use Coupon
        </button>
      </div>
    </div>
  );
};

export default StoreDetail;