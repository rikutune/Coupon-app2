import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Store } from '../data/stores';

// ここにあなたのMapboxアクセストークンを入れてください
mapboxgl.accessToken = 'pk.eyJ1IjoicmlrdXR1bmUiLCJhIjoiY203dmpqYmpmMDBpNjJycTR5ZXhuOXc2MiJ9.nBnOIvvjuYaF-xcgb1_8Lg';

interface MapProps {
  stores: Store[];
}

const Map: React.FC<MapProps> = ({ stores }) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([139.7671, 35.6812]); // 東京駅をデフォルトに
  
  // コンポーネントがマウントされたときにマップを初期化
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation[0], userLocation[1]],
        zoom: 12,
        pitch: 45, // 3D効果のための角度設定
        bearing: 0,
        antialias: true // 滑らかな描画のため
      });

      // ナビゲーションコントロールを追加
      map.current.addControl(new mapboxgl.NavigationControl());
      
      // ユーザーの位置情報を取得
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation([longitude, latitude]);
            map.current?.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              essential: true
            });
          },
          () => {
            // エラーまたは許可拒否の場合 - デフォルト位置を使用
            console.log('位置情報が取得できません - デフォルト位置を使用します');
          }
        );
      }

      // 3D建物を有効にする
      map.current.on('load', () => {
        if (!map.current) return;
        
        // 3D建物レイヤーを追加
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });

        // 各店舗のマーカーを追加
        stores.forEach(store => {
          // マーカー要素を作成
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/pin.png)';
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';
          
          // ポップアップを作成
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="text-center">
                <h3 class="font-bold">${store.name}</h3>
                <p class="text-red-600 font-semibold">${store.discount}</p>
                <button
                  class="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 view-details"
                  data-store-id="${store.id}"
                >
                  詳細を見る
                </button>
              </div>
            `);

          // マーカーをマップに追加
          new mapboxgl.Marker(el)
            .setLngLat([store.coordinates[1], store.coordinates[0]]) // Mapboxは[経度, 緯度]の順
            .setPopup(popup)
            .addTo(map.current!);
            
          // マーカーのクリックハンドラを追加
          el.addEventListener('click', () => {
            navigate(`/store/${store.id}`);
          });
        });
        
        // ポップアップボタンのクリックイベントを追加
        map.current.getCanvas().addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('view-details')) {
            const storeId = target.getAttribute('data-store-id');
            if (storeId) {
              navigate(`/store/${storeId}`);
            }
          }
        });
        
        // マップ自体のクリックハンドラを追加
        map.current.on('click', (e) => {
          // クリックポイントに最も近い店舗を見つける
          const clickPoint = [e.lngLat.lng, e.lngLat.lat];
          let closestStore = null;
          let closestDistance = Infinity;
          
          stores.forEach(store => {
            const storeLng = store.coordinates[1]; // 経度
            const storeLat = store.coordinates[0]; // 緯度
            
            // 単純な距離計算（完璧ではないがデモとしては機能する）
            const distance = Math.sqrt(
              Math.pow(clickPoint[0] - storeLng, 2) + 
              Math.pow(clickPoint[1] - storeLat, 2)
            );
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestStore = store;
            }
          });
          
          // クリックが店舗に十分近い場合（閾値0.01度）
          if (closestStore && closestDistance < 0.01) {
            navigate(`/store/${closestStore.id}`);
          }
        });
      });
    }
    
    // クリーンアップ関数
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [stores, navigate]);

  // ユーザー位置が変更されたらマーカーを追加
  useEffect(() => {
    if (!map.current) return;
    
    // ユーザー位置マーカー
    const userMarker = new mapboxgl.Marker({
      color: '#3b82f6',
      scale: 1
    })
      .setLngLat([userLocation[0], userLocation[1]])
      .addTo(map.current);
    
    // クリーンアップ
    return () => {
      userMarker.remove();
    };
  }, [userLocation]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;
