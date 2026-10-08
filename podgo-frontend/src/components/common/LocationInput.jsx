import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LocationInput({ 
  label, 
  placeholder, 
  iconClass, 
  className, 
  onLocationSelect, 
  onSetOnMapClick, 
  value, 
  onChange,
  hideLabel = false,
  hideIcon = false,
  inputClassName = "w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 pl-12 pr-10 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [userLoc, setUserLoc] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Locating...");

  const wrapperRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const cancelTokenRef = useRef(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLoc({ lat, lng }); const cacheKey = `podgo_rev_${lat.toFixed(3)}_${lng.toFixed(3)}`; const cached = sessionStorage.getItem(cacheKey); if (cached) { setCurrentAddress(cached); return; }
          
          try {
            const response = await axios.get(`https://us1.locationiq.com/v1/reverse`, {
              params: { key: import.meta.env.VITE_LOCATIONIQ_API_KEY, lat, lon: lng, format: 'json' }
            });
            const addr = response.data.address;
            let shortName = "Current Location";
            if (addr) {
                const primary = addr.suburb || addr.neighbourhood || addr.road || addr.residential || addr.city_district;
                const city = addr.city || addr.town || addr.county;
                shortName = primary && city ? `${primary}, ${city}` : (primary || city || response.data.display_name.split(',')[0]);
            } else {
                shortName = response.data.display_name.split(',').slice(0, 2).join(',');
            }
            sessionStorage.setItem(cacheKey, shortName); setCurrentAddress(shortName);
          } catch (e) {
            setCurrentAddress("Current Location");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentAddress("Location unavailable");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setCurrentAddress("Geolocation not supported");
    }
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setNoResults(false);
      return;
    }

    if (cacheRef.current[query]) {
      setSuggestions(cacheRef.current[query]);
      setNoResults(cacheRef.current[query].length === 0);
      return;
    }

    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Operation canceled due to new request.");
    }
    cancelTokenRef.current = axios.CancelToken.source();

    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
      const params = {
        key: apiKey,
        q: query,
        limit: 5,
        countrycodes: 'in', // 2. Bounding Box / Country Restriction (India only)
      };

      // 3. Apply Proximity Bias if GPS is available
      if (userLoc) {
        params.lat = userLoc.lat;
        params.lon = userLoc.lng;
      }

      const response = await axios.get(`https://api.locationiq.com/v1/autocomplete`, {
        params,
        cancelToken: cancelTokenRef.current.token
      });

      const results = response.data || [];
      cacheRef.current[query] = results;
      setSuggestions(results);
      setNoResults(results.length === 0);
      setSelectedIndex(-1);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("LocationIQ API error:", error);
        setSuggestions([]);
        // LocationIQ often returns a 404 when it finds 0 results for a query
        setNoResults(error.response && error.response.status === 404);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange?.(val);
    setShowDropdown(true);

    if (val.trim() === '') {
      onLocationSelect(null);
    }
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      searchLocation(val);
    }, 400);
  };

  const handleSelect = (feature) => {
    const placeName = feature.display_place || feature.address?.name;
    const addressDetails = feature.display_address || feature.display_name;
    const fullAddress = placeName ? `${placeName}, ${addressDetails}` : addressDetails;
    
    setInputValue(fullAddress);
    onChange?.(fullAddress);
    setShowDropdown(false);
    
    onLocationSelect({
      address: fullAddress,
      lat: parseFloat(feature.lat),
      lng: parseFloat(feature.lon)
    });
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className={`w-full relative ${className || ''}`} ref={wrapperRef}>
      {!hideLabel && label && (
        <div className="flex justify-between items-end mb-1">
          <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium">{label}</label>
          {userLoc && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-success-500)] font-medium animate-in fade-in" title="GPS Proximity Bias Active">
              <Navigation size={10}/> Local search active
            </span>
          )}
        </div>
      )}
      <div className="relative w-full h-full">
        {!hideIcon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass || 'text-[var(--text-muted)]'}`}>
            <MapPin size={18} />
          </div>
        )}
        <input 
          type="text" 
          required={!onSetOnMapClick} 
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onClick={() => setShowDropdown(true)}
          className={inputClassName}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary-500)]">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-outline-variant/50 rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden py-1.5 max-h-60 overflow-y-auto no-scrollbar">
          
          {/* Static Options */}
          <div onClick={() => {
              if (userLoc) {
                  onLocationSelect({ address: currentAddress, lat: userLoc.lat, lng: userLoc.lng });
                  setInputValue(currentAddress);
                  setShowDropdown(false);
              } else {
                  toast.error("Please enable GPS");
              }
          }} className="px-4 py-4 cursor-pointer border-b border-outline-variant/30 hover:bg-surface-container flex items-center gap-3 transition-colors">
              <div className="bg-surface text-on-surface p-1.5 rounded-full ring-1 ring-outline-variant/50"><Navigation size={14}/></div>
              <div>
                  <p className="text-body-md font-bold text-on-surface">{currentAddress}</p>
                  <p className="text-label-sm text-on-surface-variant">Your current location</p>
              </div>
          </div>

          {onSetOnMapClick && (
            <div onClick={() => {
                setShowDropdown(false);
                onSetOnMapClick();
            }} className="px-4 py-4 cursor-pointer border-b border-outline-variant/30 hover:bg-surface-container flex items-center gap-3 text-on-surface transition-colors">
                <div className="bg-surface p-1.5 rounded-full ring-1 ring-outline-variant/50"><MapPin size={14}/></div>
                <p className="text-body-md font-bold text-on-surface">Set location on map</p>
            </div>
          )}

          {/* Dynamic Results */}
          {noResults ? (
            <div className="px-4 py-3 text-label-md text-on-surface-variant/70 italic">
              No locations found
            </div>
          ) : (
            suggestions.map((feature, index) => {
              const placeName = feature.display_place || feature.address?.name;
              const placeAddress = feature.display_address;
              
              return (
                <div 
                  key={`${index}-${feature.place_id}`}
                  onClick={() => handleSelect(feature)}
                  className={`px-4 py-4 cursor-pointer border-b border-outline-variant/30 last:border-0 transition-colors flex items-center gap-3 ${index === selectedIndex ? 'bg-surface-container' : 'hover:bg-surface-container'}`}
                >
                  <div className="text-on-surface-variant"><MapPin size={16}/></div>
                  <div>
                      <p className="text-body-md font-bold text-on-surface">{placeName}</p>
                      {placeAddress && <p className="text-label-sm text-on-surface-variant mt-0.5">{placeAddress}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


