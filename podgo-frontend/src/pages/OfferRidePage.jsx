import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import LocationInput from '../components/common/LocationInput';
import MapComponent from '../components/common/MapComponent';
import DateTimePicker from '../components/common/DateTimePicker';
import api from '../services/api';
import { Calendar, Clock, Users, IndianRupee, ArrowRight, AlertCircle, Wand2, MapPin, X, Info, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function OfferRidePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState('ONE_WAY');
  
  // Drag logic states
  const sheetRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragStartY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY - currentY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const y = e.touches[0].clientY - dragStartY.current;
    
    // Allow dragging down (y > 0) but resist dragging up beyond origin (y < 0)
    const newY = y < 0 ? y * 0.1 : y; 
    currentY.current = newY;
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${newY}px)`;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      
      const threshold = 100; // Drag down 100px to collapse
      const height = sheetRef.current.offsetHeight;
      const collapseY = height - 80; // Leave 80px visible
      
      if (currentY.current > threshold && !isCollapsed) {
        // Snap to collapsed
        setIsCollapsed(true);
        currentY.current = collapseY;
      } else if (currentY.current < collapseY - threshold && isCollapsed) {
        // Snap back to expanded
        setIsCollapsed(false);
        currentY.current = 0;
      } else {
        // Revert to current state
        currentY.current = isCollapsed ? collapseY : 0;
      }
      
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatingFare, setCalculatingFare] = useState(false);
  
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  
  const [mapSelectionMode, setMapSelectionMode] = useState('none'); // 'none', 'origin', 'destination'

  const [formData, setFormData] = useState({
    originStr: '',
    destStr: '',
    date: '',
    time: '',
    returnDate: '',
    returnTime: '',
    seats: 3,
    fare: 0
  });

  const [baseFare, setBaseFare] = useState(0);
  const [additionalFare, setAdditionalFare] = useState(0);

  useEffect(() => {
    setFormData(prev => ({ ...prev, fare: baseFare + additionalFare }));
  }, [baseFare, additionalFare]);

  useEffect(() => {
    if (origin && destination && waypoints.length > 0) {
      calculateRecommendedFare();
    }
  }, [origin, destination, waypoints, tripType]);

  const calculateRecommendedFare = async () => {
    setCalculatingFare(true);
    try {
      const res = await api.post('/rides/calculate-fare', { waypoints });
      let calculated = Math.round(res.data.data.recommendedFare);
      if (tripType === 'ROUND_TRIP') {
        calculated *= 2;
      }
      setBaseFare(calculated);
      // Reset additional fare when recalculating
      setAdditionalFare(0);
    } catch (err) {
      console.error("Fare calculation failed", err);
    } finally {
      setCalculatingFare(false);
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
      // Auto-infer if user just clicks map casually
      if (!origin) {
        isOrigin = true;
      } else if (!destination) {
        isOrigin = false;
      } else {
        // Both are set. Do nothing.
        return;
      }
    }

    setMapSelectionMode('none');
    reverseGeocodeAndUpdate(coords, isOrigin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      setError("Please select valid locations from the map suggestions.");
      return;
    }
    if (!formData.fare) {
      setError("Please wait for the fare calculation to complete.");
      return;
    }
    if (waypoints.length === 0) {
      setError("Please wait for the route to be calculated on the map.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const departureTime = `${formData.date}T${formData.time}:00`;
      
      if (tripType === 'ONE_WAY') {
        await api.post('/rides', {
          origin: origin.address,
          originLat: origin.lat,
          originLng: origin.lng,
          destination: destination.address,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          departureTime,
          availableSeats: Number(formData.seats),
          farePerSeat: Number(formData.fare),
          waypoints: waypoints
        });
      } else {
        // ROUND_TRIP
        const returnDepartureTime = `${formData.returnDate}T${formData.returnTime}:00`;
        const halfFare = Math.round(Number(formData.fare) / 2);
        
        // Outbound
        await api.post('/rides', {
          origin: origin.address,
          originLat: origin.lat,
          originLng: origin.lng,
          destination: destination.address,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          departureTime,
          availableSeats: Number(formData.seats),
          farePerSeat: halfFare,
          waypoints: waypoints
        });
        
        // Inbound (reversed)
        await api.post('/rides', {
          origin: destination.address,
          originLat: destination.lat,
          originLng: destination.lng,
          destination: origin.address,
          destinationLat: origin.lat,
          destinationLng: origin.lng,
          departureTime: returnDepartureTime,
          availableSeats: Number(formData.seats),
          farePerSeat: halfFare,
          waypoints: [...waypoints].reverse()
        });
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      <div className="absolute inset-0 z-0 pt-16">
        {mapSelectionMode !== 'none' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-surface-container-high border border-primary shadow-lg rounded-full px-4 py-2 flex items-center gap-3 animate-in slide-in-from-top-4">
            <MapPin size={18} className="text-primary animate-bounce" />
            <span className="text-sm font-semibold text-on-surface">
              Tap anywhere to set {mapSelectionMode === 'origin' ? 'pickup' : 'destination'}
            </span>
            <button onClick={() => setMapSelectionMode('none')} className="ml-2 p-1 bg-surface-dim hover:bg-surface-container-lowest rounded-full transition-colors">
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

      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        className="absolute bottom-0 left-0 w-full bg-surface-container rounded-t-[32px] p-6 pt-3 pb-[calc(env(safe-area-inset-bottom,34px)+24px)] z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] max-h-[85vh] overflow-y-auto no-scrollbar"
      >
        {/* Drag Handle */}
        <div 
          className="w-full flex justify-center pb-3 pt-1 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => {
            isDragging.current = true;
            dragStartY.current = e.clientY - currentY.current;
            if (sheetRef.current) sheetRef.current.style.transition = 'none';
          }}
          onMouseMove={(e) => {
            if (!isDragging.current) return;
            const y = e.clientY - dragStartY.current;
            const newY = y < 0 ? y * 0.1 : y; 
            currentY.current = newY;
            if (sheetRef.current) sheetRef.current.style.transform = `translateY(${newY}px)`;
          }}
          onMouseUp={handleTouchEnd}
          onMouseLeave={() => {
            if (isDragging.current) handleTouchEnd();
          }}
        >
          <div className="w-12 h-1.5 rounded-full bg-on-surface-variant/40"></div>
        </div>

        {step === 1 ? (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-headline-sm font-display font-bold text-center text-on-surface mb-1">
              Plan your Intercity ride
            </h2>
            
            {tripType === 'ROUND_TRIP' && formData.fare ? (
               <p className="text-center text-on-surface-variant text-label-md mb-4">Starting at ₹{formData.fare * 2}</p>
            ) : (
               <div className="h-4 mb-4"></div>
            )}
            
            {/* Segmented Control */}
            <div className="flex gap-3 mb-5">
               <button 
                  onClick={() => setTripType('ONE_WAY')} 
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl border transition-colors ${tripType === 'ONE_WAY' ? 'bg-surface-container-high border-outline text-on-surface' : 'bg-surface-container-low border-transparent text-on-surface-variant'}`}
                >
                  <span className="font-semibold text-title-md">One way</span>
                  <span className="text-label-sm mt-0.5">Ride to destination</span>
               </button>
               <button 
                  onClick={() => setTripType('ROUND_TRIP')} 
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl border transition-colors ${tripType === 'ROUND_TRIP' ? 'bg-surface-container-high border-outline text-on-surface' : 'bg-surface-container-low border-transparent text-on-surface-variant'}`}
                >
                  <span className="font-semibold text-title-md">Round trip</span>
                  <span className="text-label-sm mt-0.5">Same car till return</span>
               </button>
            </div>
            
            {/* Timeline Inputs */}
            <div className="bg-surface-container-low rounded-[20px] p-4 relative mb-2 flex flex-col gap-1">
               <div className="absolute left-[26px] top-[32px] bottom-[32px] w-0.5 bg-outline-variant/30 z-0"></div>
               
               <div className="flex items-center gap-4 relative z-30 group">
                  <div className="w-[18px] h-[18px] rounded-full border-[5px] border-surface-container-low bg-on-surface ring-2 ring-on-surface flex-shrink-0 z-10 transition-colors group-focus-within:bg-primary group-focus-within:ring-primary"></div>
                  <LocationInput 
                    placeholder="Origin" 
                    value={formData.originStr}
                    onChange={val => setFormData({...formData, originStr: val})}
                    onLocationSelect={(location) => {
                      setOrigin(location);
                      if (location) setFormData((prev) => ({ ...prev, originStr: location.address }));
                    }} 
                    onSetOnMapClick={() => setMapSelectionMode('origin')}
                    hideLabel
                    hideIcon
                    inputClassName="w-full bg-transparent border-b border-outline-variant/30 py-3 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                  />
               </div>

               {tripType === 'ROUND_TRIP' && (
                  <div className="flex items-center gap-4 relative z-20 group">
                     <div className="w-[14px] h-[14px] rounded-sm bg-outline flex-shrink-0 mx-[2px] z-10 ring-[3px] ring-surface-container-low transition-colors group-focus-within:bg-primary group-focus-within:ring-primary/30"></div>
                     <LocationInput 
                        placeholder="Destination" 
                        value={formData.destStr}
                        onChange={val => setFormData({...formData, destStr: val})}
                        onLocationSelect={(location) => {
                          setDestination(location);
                          if (location) setFormData((prev) => ({ ...prev, destStr: location.address }));
                        }} 
                        onSetOnMapClick={() => setMapSelectionMode('destination')}
                        hideLabel
                        hideIcon
                        inputClassName="w-full bg-transparent border-b border-outline-variant/30 py-3 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                      />
                  </div>
               )}

               <div className="flex items-center gap-4 relative z-10 group">
                  <div className="w-[14px] h-[14px] rounded-sm bg-on-surface flex-shrink-0 mx-[2px] z-10 ring-[3px] ring-surface-container-low transition-colors group-focus-within:bg-primary group-focus-within:ring-primary"></div>
                  {tripType === 'ONE_WAY' ? (
                    <LocationInput 
                      placeholder="Where to?" 
                      value={formData.destStr}
                      onChange={val => setFormData({...formData, destStr: val})}
                      onLocationSelect={(location) => {
                        setDestination(location);
                        if (location) setFormData((prev) => ({ ...prev, destStr: location.address }));
                      }} 
                      onSetOnMapClick={() => setMapSelectionMode('destination')}
                      hideLabel
                      hideIcon
                      inputClassName="w-full bg-transparent border-b border-transparent py-3 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Return to Origin" 
                      className="w-full bg-transparent border-b border-transparent py-3 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none" 
                      value={formData.originStr ? `Return to ${formData.originStr.split(',')[0]}` : 'Return to Origin'} 
                      readOnly 
                    />
                  )}
               </div>
            </div>

            {tripType === 'ROUND_TRIP' && (
               <div className="flex items-center gap-1.5 text-on-surface-variant text-label-sm mb-5 px-1">
                  <Info size={14} /> You can take multiple stops till return
               </div>
            )}
            {tripType === 'ONE_WAY' && <div className="h-5 mb-5"></div>}
            
            {/* Actions Area */}
            {tripType === 'ROUND_TRIP' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-title-md font-semibold text-on-surface">Pickup time</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#4FDBC8] bg-[#4FDBC8]/10 px-2 py-0.5 rounded-sm">
                    <Tag size={12} /> Leave later for lower prices
                  </span>
                </div>
                <div className="flex items-center justify-between bg-surface-container-low rounded-[20px] p-2 pr-2 pl-4">
                  <button className="flex items-center gap-3 text-on-surface font-semibold text-title-md py-3" onClick={() => toast("Leave now feature coming soon!")}>
                     <Clock size={22} className="text-on-surface-variant" /> Now
                  </button>
                  <button className="bg-surface-container-highest border border-outline-variant text-on-surface px-6 py-3 rounded-[14px] font-semibold flex items-center gap-2" onClick={() => setStep(2)}>
                     <Calendar size={18} /> Later
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-surface-container-low rounded-[20px] p-2 pr-2 pl-4">
                 <button className="flex items-center gap-3 text-on-surface font-semibold text-title-md py-3" onClick={() => toast("Leave now feature coming soon!")}>
                    <Clock size={22} className="text-on-surface-variant" /> Leave now
                 </button>
                 <button className="bg-surface-container-highest border border-outline-variant text-on-surface px-6 py-3 rounded-[14px] font-semibold flex items-center gap-2" onClick={() => setStep(2)}>
                    <Calendar size={18} /> Later
                 </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-highest text-on-surface transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-title-lg font-bold text-on-surface">Schedule Details</h2>
            </div>

            {error && (
              <div className="mb-6 bg-error-container/20 border border-error/30 text-error p-4 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-2">
                <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Departure Time</label>
                <DateTimePicker 
                  date={formData.date}
                  time={formData.time}
                  onDateChange={(val) => setFormData(prev => ({...prev, date: val}))}
                  onTimeChange={(val) => setFormData(prev => ({...prev, time: val}))}
                />
              </div>

              {tripType === 'ROUND_TRIP' && (
                <div className="mb-2">
                  <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Returning on</label>
                  <DateTimePicker 
                    date={formData.returnDate}
                    time={formData.returnTime}
                    onDateChange={(val) => setFormData(prev => ({...prev, returnDate: val}))}
                    onTimeChange={(val) => setFormData(prev => ({...prev, returnTime: val}))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Seats Card */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={18} className="text-on-surface" />
                      <span className="font-bold text-title-md text-on-surface">Available Seats</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">How many seats are available?</p>
                  </div>
                  
                  <div className="flex items-center justify-between bg-surface-container rounded-xl p-1">
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({...prev, seats: Math.max(1, prev.seats - 1)}))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                    >
                      <span className="text-xl font-bold leading-none">-</span>
                    </button>
                    <span className="text-title-lg font-bold text-on-surface">{formData.seats}</span>
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({...prev, seats: Math.min(6, prev.seats + 1)}))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                    >
                      <span className="text-xl font-bold leading-none">+</span>
                    </button>
                  </div>
                </div>

                {/* Fare Card */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <IndianRupee size={18} className="text-on-surface" />
                        <span className="font-bold text-title-md text-on-surface">Fare per Seat</span>
                      </div>
                      {calculatingFare && <Wand2 size={14} className="text-primary animate-pulse" />}
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">Set the price per seat</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface font-bold text-title-lg">₹</div>
                    <input 
                      type="text" 
                      readOnly 
                      value={baseFare > 0 ? baseFare + additionalFare : '---'} 
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-3 pl-10 pr-2 text-title-lg font-bold text-on-surface focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Quick Price Options */}
              <div className="mb-6">
                <label className="block text-label-md font-semibold text-on-surface-variant mb-3">Quick Price Options</label>
                <div className="flex items-center justify-between gap-2">
                  {[100, 250, 500, 700].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setAdditionalFare(prev => prev === amount ? 0 : amount)}
                      disabled={baseFare === 0}
                      className={`flex-1 py-2.5 rounded-xl border font-bold text-title-md transition-colors ${additionalFare === amount ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface border-outline-variant/50 hover:bg-surface-container-high'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading || (origin && destination && waypoints.length === 0)}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary py-4 rounded-[14px] font-bold text-title-md transition-transform active:scale-[0.98] disabled:opacity-70 shadow-[0_4px_12px_rgba(192,193,255,0.2)]"
                >
                  {loading ? 'Posting...' : 'Publish Ride'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}




