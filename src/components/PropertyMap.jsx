import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import mapsService from '../firebase/mapsService.js';

const PropertyMap = ({ 
  latitude, 
  longitude, 
  address, 
  className = "" 
}) => {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    setIsLoading(true);
    setError('');

    mapsService.createMap(mapRef.current, latitude, longitude, address)
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error creating map:', err);
        setError('Unable to load map');
        setIsLoading(false);
      });
  }, [latitude, longitude, address]);

  if (!latitude || !longitude) {
    return (
      <div className={`map-placeholder ${className}`}>
        <div className="map-placeholder-icon">📍</div>
        <div className="map-placeholder-text">No location data</div>
        <div className="map-placeholder-subtext">Address coordinates not available</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`map-placeholder ${className}`}>
        <div className="map-placeholder-icon">⚠️</div>
        <div className="map-placeholder-text">Map unavailable</div>
        <div className="map-placeholder-subtext">{error}</div>
      </div>
    );
  }

  return (
    <div className={`property-map-container ${className}`}>
      {isLoading && (
        <div className="map-loading">
          <div className="map-loading-spinner"></div>
          <div className="map-loading-text">Loading map...</div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`property-map ${isLoading ? 'loading' : ''}`}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default PropertyMap;


