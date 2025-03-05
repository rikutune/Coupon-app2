import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin } from 'lucide-react';
import { stores } from '../data/stores';
import Map from '../components/Map';

const CouponList = () => {
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const currentTranslateY = useRef<number>(0);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = y;
    if (panelRef.current) {
      const transform = window.getComputedStyle(panelRef.current).transform;
      const matrix = new DOMMatrix(transform);
      currentTranslateY.current = matrix.m42;
    }
  };

  const handleDrag = (e: TouchEvent | MouseEvent) => {
    if (dragStartY.current === null || !panelRef.current) return;
    
    const y = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    const deltaY = y - dragStartY.current;
    const newTranslateY = currentTranslateY.current + deltaY;
    
    const maxTranslate = window.innerHeight - 40; // Leave 40px visible
    const minTranslate = 0;
    
    const constrainedTranslate = Math.min(Math.max(newTranslateY, minTranslate), maxTranslate);
    panelRef.current.style.transform = `translateY(${constrainedTranslate}px)`;
  };

  const handleDragEnd = () => {
    if (!panelRef.current || dragStartY.current === null) return;
    
    const transform = window.getComputedStyle(panelRef.current).transform;
    const matrix = new DOMMatrix(transform);
    const currentY = matrix.m42;
    
    const threshold = window.innerHeight * 0.5;
    const shouldClose = currentY > threshold;
    
    setIsPanelOpen(!shouldClose);
    panelRef.current.style.transform = '';
    dragStartY.current = null;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e);
    const handleTouchMove = (e: TouchEvent) => handleDrag(e);
    
    if (dragStartY.current !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold">Available Coupons</h1>
        </div>
      </header>

      <main className="pt-[64px] h-screen relative">
        <div className="h-full">
          <Map stores={stores} />
        </div>

        <div
          ref={panelRef}
          className={`slide-panel fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-20 ${
            isPanelOpen ? '' : 'closed'
          }`}
        >
          <div
            className="panel-handle-area"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="panel-handle" />
          </div>

          <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => navigate(`/store/${store.id}`)}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold">{store.name}</h2>
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                        {store.discount}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{store.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CouponList;