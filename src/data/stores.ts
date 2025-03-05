export interface Store {
  id: string;
  name: string;
  discount: string;
  description: string;
  image: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export const stores: Store[] = [
  {
    id: '1',
    name: 'Don Quijote',
    discount: '10% OFF',
    description: 'Get 10% off on all items! Valid until end of month.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=60',
    location: '2-4-7 Shinjuku, Tokyo',
    coordinates: [35.6938, 139.7033]
  },
  {
    id: '2',
    name: 'Matsumoto Kiyoshi',
    discount: '¥500 OFF',
    description: '¥500 off on purchases over ¥3000. Cosmetics and health products only.',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&auto=format&fit=crop&q=60',
    location: '1-1-3 Shibuya, Tokyo',
    coordinates: [35.6580, 139.7016]
  },
  {
    id: '3',
    name: 'Skylark',
    discount: '15% OFF',
    description: '15% discount on your total bill. Valid for dinner time only.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
    location: '3-2-1 Roppongi, Tokyo',
    coordinates: [35.6629, 139.7315]
  }
];