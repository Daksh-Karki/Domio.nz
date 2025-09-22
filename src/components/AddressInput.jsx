import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import mapsService from '../firebase/mapsService.js';

const AddressInput = ({ 
  value, 
  onChange, 
  onPlaceSelected, 
  placeholder = "Enter property address...",
  required = false,
  disabled = false,
  className = ""
}) => {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!inputRef.current) return;

    console.log('Initializing address input...');
    setIsLoading(true);
    setError('');

    // Initialize autocomplete
    const initAutocomplete = async () => {
      try {
        const autocomplete = await mapsService.createAutocomplete(inputRef.current, (placeData) => {
          console.log('Place selected:', placeData);
          setIsLoading(false);
          setError('');
          setIsValid(true);
          
          // Update the input value with formatted address
          if (inputRef.current) {
            inputRef.current.value = placeData.formattedAddress;
          }
          
          // Call the onChange handler with the formatted address
          if (onChange) {
            onChange(placeData.formattedAddress);
          }
          
          // Call the onPlaceSelected handler with full place data
          if (onPlaceSelected) {
            onPlaceSelected(placeData);
          }
        });
        
        setIsLoading(false);
        console.log('Autocomplete initialized successfully');
        
        // Apply custom styling to the autocomplete dropdown
        setTimeout(() => {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            pacContainer.style.borderRadius = '8px';
            pacContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            pacContainer.style.border = 'none';
            pacContainer.style.marginTop = '4px';
            pacContainer.style.zIndex = '9999';
          }
        }, 100);
        
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setError('Address autocomplete not available. You can still type the address manually.');
        setIsLoading(false);
        
        // Still allow manual input even if autocomplete fails
        if (inputRef.current) {
          inputRef.current.placeholder = placeholder || 'Enter address manually...';
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initAutocomplete, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [onChange, onPlaceSelected]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Update the value
    if (onChange) {
      onChange(inputValue);
    }
    
    // Reset validation state when user types
    if (isValid) {
      setIsValid(false);
    }
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Show loading state when user is typing (for autocomplete suggestions)
    if (inputValue.length > 2 && !isLoading) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleInputBlur = () => {
    // If the input has a value but no valid place was selected, show warning
    // Only show this if Google Maps is working (no error state)
    if (value && !isValid && !error && !error.includes('unavailable')) {
      setError('Please select a valid address from the suggestions');
    }
  };

  const handleInputFocus = () => {
    // Clear error when user focuses on input
    if (error) {
      setError('');
    }
  };

  return (
    <div className={`address-input-container ${className}`}>
      <div className="address-input-wrapper">
        <div className="address-input-icon">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MapPin size={20} />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`address-input ${isValid ? 'valid' : ''} ${error ? 'error' : ''}`}
          style={{ 
            cursor: disabled ? 'not-allowed' : 'text',
            pointerEvents: disabled ? 'none' : 'auto'
          }}
        />
        
        {isValid && (
          <div className="address-valid-indicator">
            ✓
          </div>
        )}
      </div>
      
      {error && (
        <div className="address-error">
          {error}
        </div>
      )}
      
      <div className="address-help">
        {isLoading ? 'Loading address suggestions...' : 
         error && error.includes('unavailable') ? 'Type the address manually' : 
         error ? 'Please select from suggestions' : 
         'Start typing to see address suggestions from New Zealand'}
      </div>
      
      {error && (
        <div className="address-fallback">
          <small>
            {error.includes('unavailable') ? 'Autocomplete unavailable. You can still type the address manually.' : error}
          </small>
        </div>
      )}
    </div>
  );
};

export default AddressInput;
