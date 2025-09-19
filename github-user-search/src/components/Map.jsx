import { useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiMapPin } from 'react-icons/fi';

// Fix for default marker icons in Next.js
const defaultIcon = typeof window !== 'undefined' ? L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

// Custom icon for GitHub users
const createUserIcon = (color = '#0366d6') => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 32px; height: 32px; transform: translate(-50%, -50%);">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </div>
      </div>
    `,
    className: 'user-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const Map = ({ users = [], center, zoom = 2, className = '', onMarkerClick }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapInstance = useRef(null);
  
  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!mapRef.current) return;
    
    // Initialize the map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [center?.lat || 20, center?.lng || 0],
        zoom: zoom,
        zoomControl: false,
      });
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
      
      // Add zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstance.current);
    }
    
    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);
  
  // Update map view when center or zoom changes
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setView([center.lat, center.lng], zoom);
    }
  }, [center?.lat, center?.lng, zoom]);
  
  // Update markers when users change
  useEffect(() => {
    if (!mapInstance.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });
    markersRef.current = [];
    
    // Add new markers for each user with location
    users.forEach(user => {
      if (!user.location || !user.lat || !user.lng) return;
      
      // Skip invalid coordinates
      if (Math.abs(user.lat) > 90 || Math.abs(user.lng) > 180) return;
      
      const marker = L.marker([user.lat, user.lng], {
        icon: user.avatar_url 
          ? createUserIcon() 
          : defaultIcon,
        title: user.login || 'GitHub User',
      }).addTo(mapInstance.current);
      
      // Add popup with user info
      if (user.login) {
        const popupContent = `
          <div class="p-2">
            <div class="flex items-center space-x-3">
              ${user.avatar_url ? `
                <img 
                  src="${user.avatar_url}" 
                  alt="${user.login}" 
                  class="w-10 h-10 rounded-full border border-gray-200"
                  onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.login)}&background=random';"
                />
              ` : ''}
              <div>
                <div class="font-semibold text-gray-900">${user.name || user.login}</div>
                ${user.location ? `<div class="text-sm text-gray-500">${user.location}</div>` : ''}
              </div>
            </div>
            ${user.bio ? `<div class="mt-2 text-sm text-gray-700">${user.bio}</div>` : ''}
            <div class="mt-2 flex space-x-2">
              <div class="text-xs bg-gray-100 px-2 py-1 rounded">
                <span class="font-medium">${user.public_repos || 0}</span> repos
              </div>
              <div class="text-xs bg-gray-100 px-2 py-1 rounded">
                <span class="font-medium">${user.followers || 0}</span> followers
              </div>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          minWidth: 200,
          className: 'user-popup',
        });
      }
      
      // Add click handler
      marker.on('click', () => {
        if (onMarkerClick && user.login) {
          onMarkerClick(user.login);
        }
      });
      
      markersRef.current.push(marker);
    });
    
    // Fit bounds to show all markers if we have any
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
    
  }, [users, onMarkerClick]);
  
  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[400px] bg-gray-100 rounded-xl overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* Fallback content for when map can't be loaded */}
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
        <div className="text-center p-6">
          <FiMapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium">Map Loading</p>
          <p className="text-sm mt-1">Interactive map will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Map;
