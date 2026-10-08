import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { MapPin, Calendar, Clock, IndianRupee, Users, ArrowRight, Star, Car } from 'lucide-react';
import LocationInput from '../components/common/LocationInput';

export default function SearchResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingRide, setBookingRide] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [pickupPoint, setPickupPoint] = useState('');
  const [pickupLat, setPickupLat] = useState(0);
  const [pickupLng, setPickupLng] = useState(0);

  useEffect(() => {
    if (!state) {
      navigate('/find-ride');
      return;
    }
    setPickupPoint(state.origin || '');
    fetchRides();
  }, [state]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await api.post('/rides/search', {
        origin: state.origin,
        originLat: state.originLat,
        originLng: state.originLng,
        destination: state.destination,
        destLat: state.destLat,
        destLng: state.destLng,
        date: state.date,
        seatsRequired: Number(state.seats)
      });
      setRides(res.data.data);
    } catch (err) {
      setError('Failed to fetch rides.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookingRide) return;
    try {
      await api.post('/bookings', {
        rideId: bookingRide.id,
        pickupPoint,
        pickupLat,
        pickupLng,
        paymentMethod
      });
      alert('Booking request sent successfully!');
      setBookingRide(null);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book ride');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] pb-20">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar />
      
      {/* Header Summary */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)] pt-8 pb-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-3">
              <span className="truncate max-w-[150px] md:max-w-[300px]">{state?.origin.split(',')[0]}</span>
              <ArrowRight size={18} className="text-[var(--text-muted)]" />
              <span className="truncate max-w-[150px] md:max-w-[300px]">{state?.destination.split(',')[0]}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1"><Calendar size={14}/> {state?.date}</span>
              <span className="flex items-center gap-1"><Users size={14}/> {state?.seats} seat(s)</span>
            </p>
          </div>
          <button onClick={() => navigate('/find-ride')} className="text-[var(--color-primary-500)] text-sm font-medium hover:underline">
            Modify Search
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && <p className="text-[var(--color-danger-500)] mb-4">{error}</p>}
        
        {rides.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-[16px] border border-[var(--border)]">
            <Car size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-xl font-bold mb-2">No rides found</h3>
            <p className="text-[var(--text-secondary)] text-sm">We couldn't find any rides matching your route on this date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map(ride => {
              const depDate = new Date(ride.departureTime);
              return (
                <div key={ride.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-5 hover:border-[var(--color-primary-500)] transition-colors cursor-pointer group shadow-[var(--shadow-card)]"
                     onClick={() => setBookingRide(ride)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        {ride.driverPhotoUrl ? (
                          <img src={ride.driverPhotoUrl} alt="driver" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-bold text-lg">
                            {ride.driverName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)]">{ride.driverName}</h4>
                        <div className="flex items-center gap-1 text-[12px] text-[var(--color-accent-500)] font-medium">
                          <Star size={12} fill="currentColor" /> {ride.driverRating > 0 ? ride.driverRating.toFixed(1) : 'New'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--color-success-500)] flex items-center justify-end">
                        <IndianRupee size={20} />{ride.farePerSeat}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">per seat</span>
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-strong)]">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-[10px] h-[10px] rounded-full bg-[var(--color-primary-500)] border-2 border-[var(--bg-card)]"></div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {depDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{ride.origin}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-[10px] h-[10px] rounded-full bg-[var(--color-accent-500)] border-2 border-[var(--bg-card)]"></div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{ride.destination}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--border)] flex justify-between items-center text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-2"><Car size={16}/> {ride.vehicleModel}</span>
                    <span className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                      <Users size={16} className="text-[var(--color-primary-500)]"/> {ride.availableSeats} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingRide && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--bg-card)] rounded-[20px] max-w-sm w-full p-6 shadow-2xl border border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4">Request Seat</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">You are requesting {state.seats} seat(s) from {bookingRide.driverName}.</p>
            
            <div className="mb-4">
              <LocationInput 
                label="Exact Pickup Point"
                placeholder="Enter specific pickup location"
                value={pickupPoint}
                onChange={setPickupPoint}
                onLocationSelect={(data) => {
                  setPickupLat(data.lat);
                  setPickupLng(data.lng);
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-2">Payment Method</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex-1 py-3 rounded-[10px] text-sm font-bold transition-all ${paymentMethod === 'CASH' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  CASH
                </button>
                <button 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex-1 py-3 rounded-[10px] text-sm font-bold transition-all ${paymentMethod === 'UPI' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  UPI
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between font-bold text-lg mb-6 pt-4 border-t border-[var(--border)]">
              <span>Total Fare:</span>
              <span className="text-[var(--color-success-500)] flex items-center"><IndianRupee size={18}/>{bookingRide.farePerSeat * state.seats}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setBookingRide(null)} className="flex-1 py-3 rounded-[12px] font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--border)] transition-colors">
                Cancel
              </button>
              <button onClick={handleBook} className="flex-1 py-3 rounded-[12px] font-bold text-white bg-[var(--color-success-500)] hover:bg-[var(--color-success-600)] transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
