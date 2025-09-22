// Google Maps Places API service
class MapsService {
  constructor() {
    this.autocomplete = null;
    this.placesService = null;
    this.isLoaded = false;
    this.initPromise = null;
  }

  // Initialize Google Maps
  init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      console.log('Checking Google Maps availability...');
      
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps already loaded');
        this.isLoaded = true;
        resolve();
        return;
      }

      // Check if the script is still loading
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds with 100ms intervals

      const checkGoogleMaps = () => {
        attempts++;
        console.log(`Checking for Google Maps... (attempt ${attempts})`, {
          google: !!window.google,
          maps: !!(window.google && window.google.maps),
          places: !!(window.google && window.google.maps && window.google.maps.places)
        });
        
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('Google Maps loaded successfully');
          this.isLoaded = true;
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('Google Maps failed to load within timeout');
          reject(new Error('Google Maps failed to load - please check your internet connection'));
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };

      checkGoogleMaps();
    });

    return this.initPromise;
  }

  // Create autocomplete for address input using legacy Autocomplete (more reliable)
  createAutocomplete(inputElement, onPlaceSelected) {
    return this.init().then(() => {
      if (!this.isLoaded) {
        throw new Error('Google Maps not loaded');
      }

      console.log('Using legacy Autocomplete (more reliable)');
      return this.createLegacyAutocomplete(inputElement, onPlaceSelected);
    });
  }

  // New PlaceAutocompleteElement implementation
  createNewAutocomplete(inputElement, onPlaceSelected) {
    // Create a container for the autocomplete element
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    
    // Insert the container before the input and move input inside
    inputElement.parentNode.insertBefore(container, inputElement);
    container.appendChild(inputElement);
    
    // Create the new autocomplete element
    const autocompleteElement = document.createElement('gmp-place-autocomplete');
    autocompleteElement.setAttribute('placeholder', inputElement.placeholder || 'Enter address...');
    autocompleteElement.style.width = '100%';
    autocompleteElement.style.height = '100%';
    
    // Replace the input with the autocomplete element
    container.replaceChild(autocompleteElement, inputElement);
    
    // Listen for place selection
    autocompleteElement.addEventListener('gmp-placeselect', (event) => {
      const place = event.place;
      
      if (!place.geometry || !place.geometry.location) {
        console.warn('No details available for selected place');
        return;
      }

      // Extract address components
      const addressComponents = this.parseAddressComponents(place.address_components || []);
      
      const placeData = {
        formattedAddress: place.formatted_address || place.displayName,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id || place.id,
        addressComponents: addressComponents
      };

      if (onPlaceSelected) {
        onPlaceSelected(placeData);
      }
    });

    return autocompleteElement;
  }

  // Legacy Autocomplete implementation (fallback)
  createLegacyAutocomplete(inputElement, onPlaceSelected) {
    const options = {
      types: ['address'],
      componentRestrictions: { country: 'nz' }, // Restrict to New Zealand
      fields: ['formatted_address', 'geometry', 'address_components', 'place_id']
    };

    this.autocomplete = new window.google.maps.places.Autocomplete(inputElement, options);

    // Style the autocomplete dropdown
    const pacContainer = document.querySelector('.pac-container');
    if (pacContainer) {
      pacContainer.style.borderRadius = '8px';
      pacContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      pacContainer.style.border = 'none';
      pacContainer.style.marginTop = '4px';
    }

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.warn('No details available for input: ' + place.name);
        return;
      }

      // Extract address components
      const addressComponents = this.parseAddressComponents(place.address_components);
      
      const placeData = {
        formattedAddress: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id,
        addressComponents: addressComponents
      };

      if (onPlaceSelected) {
        onPlaceSelected(placeData);
      }
    });

    // Add listener for when user starts typing
    this.autocomplete.addListener('input_changed', () => {
      console.log('User is typing in address field');
    });

    return this.autocomplete;
  }

  // Parse address components
  parseAddressComponents(components) {
    const address = {
      streetNumber: '',
      route: '',
      locality: '',
      administrativeAreaLevel1: '',
      country: '',
      postalCode: ''
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        address.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        address.route = component.long_name;
      }
      if (types.includes('locality')) {
        address.locality = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.administrativeAreaLevel1 = component.long_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
      }
      if (types.includes('postal_code')) {
        address.postalCode = component.long_name;
      }
    });

    return address;
  }

  // Geocode an address
  async geocodeAddress(address) {
    await this.init();
    
    if (!this.isLoaded) {
      throw new Error('Google Maps not loaded');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          const addressComponents = this.parseAddressComponents(place.address_components);
          
          resolve({
            formattedAddress: place.formatted_address,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            placeId: place.place_id,
            addressComponents: addressComponents
          });
        } else {
          reject(new Error('Geocoding failed: ' + status));
        }
      });
    });
  }

  // Create a map with marker
  createMap(containerElement, latitude, longitude, address) {
    return this.init().then(() => {
      if (!this.isLoaded) {
        throw new Error('Google Maps not loaded');
      }

      const map = new window.google.maps.Map(containerElement, {
        zoom: 15,
        center: { lat: latitude, lng: longitude },
        mapTypeId: 'roadmap'
      });

      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: address
      });

      return { map, marker };
    });
  }
}

// Create singleton instance
const mapsService = new MapsService();

// Make it available globally for the callback
window.initGoogleMaps = () => {
  console.log('Google Maps loaded');
};

export default mapsService;
