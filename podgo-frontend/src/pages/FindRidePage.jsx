import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Users, AlertCircle, X } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import LocationInput from '../components/common/LocationInput';
import MapComponent from '../components/common/MapComponent';
import axios from 'axios';

export default function FindRidePage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [formData, setFormData] = useState({
    originStr: '',
    destStr: '',
    date: '',
    seats: '1'
  });
  const [error, setError] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [mapSelectionMode, setMapSelectionMode] = useState('none');

  const sheetRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragStartY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY - currentY.current;
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const y = e.touches[0].clientY - dragStartY.current;
    const newY = y < 0 ? y * 0.1 : y; 
    currentY.current = newY;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${newY}px)`;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      const threshold = 100;
      const height = sheetRef.current.offsetHeight;
      const collapseY = height - 80;
      
      if (currentY.current > threshold && !isCollapsed) {
        setIsCollapsed(true);
        currentY.current = collapseY;
      } else if (currentY.current < collapseY - threshold && isCollapsed) {
        setIsCollapsed(false);
        currentY.current = 0;
      } else {
        currentY.current = isCollapsed ? collapseY : 0;
      }
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  };

  const reverseGeocodeAndUpdate = async (coords, isOrigin) => {
    const setLoc = isOrigin ? setOrigin : setDestination;
    const strKey = isOrigin ? 'originStr' : 'destStr';

    setLoc({ ...coords, address: "Selected on map" });

    try {
      const res = await axios.get(`https://api.locationiq.com/v1/reverse`, {
        params: { key: import.meta.env.VITE_LOCATIONIQ_API_KEY, lat: coords.lat, lon: coords.lng, format: 'json' }
      });
      const addr = res.data.display_name;
      setFormData(prev => ({ ...prev, [strKey]: addr }));
      setLoc({ ...coords, address: addr });
    } catch (e) {
      setFormData(prev => ({ ...prev, [strKey]: "Selected on map" }));
    }
  };

  const handleMapClick = (coords) => {
    let isOrigin = true;
    if (mapSelectionMode === 'origin') {
      isOrigin = true;
    } else if (mapSelectionMode === 'destination') {
      isOrigin = false;
    } else {
      if (!origin) {
        isOrigin = true;
      } else if (!destination) {
        isOrigin = false;
      } else {
        return;
      }
    }
    setMapSelectionMode('none');
    reverseGeocodeAndUpdate(coords, isOrigin);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      setError('Please select both origin and destination.');
      return;
    }
    if (!formData.date) {
      setError('Please choose a travel date.');
      return;
    }

    navigate('/search-results', {
      state: {
        origin: origin.address,
        originLat: origin.lat,
        originLng: origin.lng,
        destination: destination.address,
        destLat: destination.lat,
        destLng: destination.lng,
        date: formData.date,
        seats: Number(formData.seats)
      }
    });
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      <div className="absolute inset-0 z-0 pt-14">
        {mapSelectionMode !== 'none' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-surface-container border border-primary shadow-lg rounded-full px-4 py-2 flex items-center gap-3 animate-in slide-in-from-top-4">
            <MapPin size={18} className="text-primary animate-bounce" />
            <span className="text-sm font-semibold text-on-surface">
              Tap anywhere on map to set {mapSelectionMode === 'origin' ? 'pickup' : 'destination'}
            </span>
            <button onClick={() => setMapSelectionMode('none')} className="ml-2 p-1 bg-surface rounded-full hover:bg-outline-variant transition-colors">
              <X size={16} className="text-on-surface-variant" />
            </button>
          </div>
        )}
        
        <MapComponent 
            origin={origin} 
            destination={destination} 
            onMapClick={handleMapClick}
            onOriginDrag={(coords) => reverseGeocodeAndUpdate(coords, true)}
            onDestinationDrag={(coords) => reverseGeocodeAndUpdate(coords, false)}
            onRouteExtracted={setWaypoints}
        />
      </div>

      {/* Desktop side panel / Mobile bottom sheet */}
      <div 
        ref={sheetRef}
        className="absolute bottom-0 left-0 w-full lg:w-[450px] lg:top-14 lg:bottom-0 lg:h-full lg:rounded-none bg-surface-container lg:bg-surface/95 lg:backdrop-blur-xl lg:border-r lg:border-outline-variant rounded-t-[32px] p-6 pt-3 pb-[calc(env(safe-area-inset-bottom,34px)+24px)] z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] lg:shadow-xl max-h-[85vh] lg:max-h-full overflow-y-auto no-scrollbar"
      >
        {/* Mobile Drag Handle */}
        <div 
          className="w-full flex justify-center pb-3 pt-1 cursor-grab active:cursor-grabbing touch-none lg:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-on-surface-variant/40"></div>
        </div>

        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 h-full">
          <div className="mb-6 lg:mt-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
              Travel smarter
            </p>
            <h1 className="mt-2 text-headline-md font-display font-bold text-on-surface">
              Find your next ride
            </h1>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error flex items-start gap-3 shadow-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 flex flex-col flex-1">
            <div className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant relative flex flex-col gap-2">
              <div className="absolute left-[26px] top-[40px] bottom-[40px] w-0.5 bg-outline-variant z-0"></div>
              
              <div className="flex items-center gap-4 relative z-20 group">
                <div className="w-[18px] h-[18px] rounded-full border-[4px] border-surface bg-on-surface ring-2 ring-on-surface flex-shrink-0 z-10 transition-colors group-focus-within:bg-primary group-focus-within:ring-primary"></div>
                <LocationInput
                  placeholder="Leaving from"
                  value={formData.originStr}
                  onChange={(val) => setFormData((prev) => ({ ...prev, originStr: val }))}
                  onLocationSelect={(location) => {
                    setOrigin(location);
                    if (location) setFormData((prev) => ({ ...prev, originStr: location.address }));
                  }}
                  onSetOnMapClick={() => setMapSelectionMode('origin')}
                  hideLabel
                  hideIcon
                  inputClassName="w-full bg-transparent border-b border-outline-variant py-3 text-body-lg font-semibold text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-4 relative z-10 group">
                <div className="w-[18px] h-[18px] flex-shrink-0 z-10 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-on-surface transition-colors group-focus-within:border-t-primary"></div>
                </div>
                <LocationInput
                  placeholder="Going to"
                  value={formData.destStr}
                  onChange={(val) => setFormData((prev) => ({ ...prev, destStr: val }))}
                  onLocationSelect={(location) => {
                    setDestination(location);
                    if (location) setFormData((prev) => ({ ...prev, destStr: location.address }));
                  }}
                  onSetOnMapClick={() => setMapSelectionMode('destination')}
                  hideLabel
                  hideIcon
                  inputClassName="w-full bg-transparent py-3 text-body-lg font-semibold text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase text-on-surface-variant font-bold mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-body-md font-semibold focus:outline-none focus:border-primary text-on-surface shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-on-surface-variant font-bold mb-1.5">
                  Seats
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <Users size={18} />
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    max="6"
                    value={formData.seats}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seats: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-body-md font-semibold focus:outline-none focus:border-primary text-on-surface shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 lg:mt-auto">
              <button
                type="submit"
                disabled={origin && destination && waypoints.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-title-md font-bold text-white transition-transform active:scale-[0.98] shadow-sm disabled:opacity-70"
              >
                <Search size={20} />
                Search rides
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


