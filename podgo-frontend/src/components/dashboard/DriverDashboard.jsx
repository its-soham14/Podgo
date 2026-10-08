import { CarFront, ArrowRight, Check, X, MessageSquare, Plus, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { startRide, completeRide, cancelRide } from '../../services/rideService';
import CancelConfirmModal from '../common/CancelConfirmModal';
import Button from '../common/Button';

export default function DriverDashboard({ clientRef, isConnected, notifications, onOpenChat }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [startingRideId, setStartingRideId] = useState(null);
  const [completingRideId, setCompletingRideId] = useState(null);
  const [rideToCancel, setRideToCancel] = useState(null);
  const [cancelReturnTrip, setCancelReturnTrip] = useState(false);
  const [expandedRideId, setExpandedRideId] = useState(null);
  const [rideBookings, setRideBookings] = useState({});

  const navigate = useNavigate();

  const fetchRides = async () => {
    try {
      const response = await api.get('/rides/driver');
      setRides(response.data.data);
    } catch (error) {
      console.error("Error fetching rides", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[0];
      if (latest.type === 'BOOKING_REQUEST' || latest.type === 'BOOKING_UPDATE' || latest.type === 'RIDE_UPDATE') {
        fetchRides();
        if (expandedRideId) {
          fetchRideBookings(expandedRideId);
        }
      }
    }
  }, [notifications, expandedRideId]);

  const fetchRideBookings = async (rideId) => {
    try {
      const response = await api.get(`/bookings/ride/${rideId}`);
      setRideBookings(prev => ({ ...prev, [rideId]: response.data.data }));
    } catch (err) {
      console.error("Error fetching bookings for ride", err);
    }
  };

  const handleToggleExpand = (rideId) => {
    if (expandedRideId === rideId) {
      setExpandedRideId(null);
    } else {
      setExpandedRideId(rideId);
      if (!rideBookings[rideId]) {
        fetchRideBookings(rideId);
      }
    }
  };

  const handleBookingAction = async (bookingId, action, rideId) => {
    try {
      await api.put(`/bookings/${bookingId}/status?action=${action}`);
      fetchRideBookings(rideId);
      fetchRides(); // Update seat count on parent
      toast.success(`Booking ${action}ed`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const handleStartRide = async (rideId) => {
    setStartingRideId(rideId);
    try {
      await startRide(rideId);
      toast.success("Ride started! Drive safe.");
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start ride");
    } finally {
      setStartingRideId(null);
    }
  };

  const handleCompleteRide = async (rideId) => {
    setCompletingRideId(rideId);
    try {
      await completeRide(rideId);
      toast.success("Ride marked as completed!");
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete ride");
    } finally {
      setCompletingRideId(null);
    }
  };

  const totalEarnings = rides.filter(r => r.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.farePerSeat * (curr.totalSeats - curr.availableSeats)), 0);
  const activeRides = rides.filter(r => !['COMPLETED', 'CANCELLED'].includes(r.status));

  const findReturnRide = (ride) => {
    if (!ride) return null;
    return activeRides.find(r => 
      r.id !== ride.id && 
      r.origin === ride.destination && 
      r.destination === ride.origin &&
      new Date(r.departureTime) > new Date(ride.departureTime)
    );
  };

  const handleCancelRide = async () => {
    if (!rideToCancel) return;
    try {
      await cancelRide(rideToCancel.id);

      if (cancelReturnTrip) {
        const returnRide = findReturnRide(rideToCancel);
        if (returnRide) {
          await cancelRide(returnRide.id);
        }
      }

      toast.success("Ride(s) cancelled successfully");
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel ride");
    } finally {
      setRideToCancel(null);
      setCancelReturnTrip(false);
    }
  };

  return (
    <div className="flex flex-col px-4 gap-space-xl pb-6">
      
      {/* Post a Ride Hero Card */}
      <div 
        className="relative rounded-[14px] overflow-hidden bg-gradient-to-br from-[#2D2E8B] via-[#1D4A6E] to-[#0D6E68] p-space-lg min-h-[88px] flex items-center cursor-pointer active:scale-[0.98] transition-transform shadow-lg border border-outline-variant/20 group"
        onClick={() => navigate('/offer-ride')}
      >
        {/* Ambient glows inside card */}
        <div className="absolute top-[-50px] right-[-20px] w-[150px] h-[150px] bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 w-full relative z-10">
          <div className="w-12 h-12 rounded-[12px] bg-surface-dim/40 backdrop-blur-md flex items-center justify-center text-primary-container">
            <CarFront size={24} />
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="font-display text-headline-sm text-on-surface">Post a Ride</h3>
            <p className="text-body-sm text-primary-container/80">Share your empty seats</p>
          </div>
          <ArrowRight size={20} className="text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container rounded-[14px] border border-outline-variant/30 p-3 text-center min-h-[72px] flex flex-col justify-center items-center shadow-sm">
          <span className="text-price-display text-on-surface font-bold leading-none">{rides.length}</span>
          <span className="text-label-sm uppercase text-outline tracking-wider mt-1.5">Rides</span>
        </div>
        <div className="bg-surface-container rounded-[14px] border border-outline-variant/30 p-3 text-center min-h-[72px] flex flex-col justify-center items-center shadow-sm">
          <span className="text-price-display text-on-surface font-bold leading-none">
            {rides.reduce((acc, curr) => acc + (curr.totalSeats - curr.availableSeats), 0)}
          </span>
          <span className="text-label-sm uppercase text-outline tracking-wider mt-1.5">Passengers</span>
        </div>
        <div className="bg-surface-container rounded-[14px] border border-outline-variant/30 p-3 text-center min-h-[72px] flex flex-col justify-center items-center shadow-sm">
          <span className="text-price-display text-success font-bold leading-none text-secondary">₹{totalEarnings}</span>
          <span className="text-label-sm uppercase text-outline tracking-wider mt-1.5">Earned</span>
        </div>
      </div>

      {/* Active Rides Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-title-md text-on-surface font-semibold">Active Rides</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeRides.length === 0 ? (
          <div className="bg-surface-container rounded-[14px] border border-outline-variant/30 p-8 flex flex-col items-center justify-center text-center">
            <CarFront size={48} className="text-on-surface-variant/40 mb-3" />
            <p className="text-title-md text-on-surface mb-1">No active rides</p>
            <p className="text-body-sm text-on-surface-variant mb-4">Post a ride to start sharing your journey.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeRides.map((ride) => {
              const bookedSeats = ride.totalSeats - ride.availableSeats;
              const isExpanded = expandedRideId === ride.id;
              const bookings = rideBookings[ride.id] || [];
              const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

              return (
                <div key={ride.id} className="bg-surface-container rounded-[14px] border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col">
                  
                  {/* Ride Header Card */}
                  <div className="p-4 flex flex-col gap-3 relative">
                    {ride.status === 'ACTIVE' && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-surface-dim rounded-full border border-secondary/30 shadow-[0_0_10px_rgba(79,219,200,0.2)]">
                         <span className="animate-ping h-1.5 w-1.5 rounded-full bg-secondary"></span>
                         <span className="text-[10px] uppercase font-bold text-secondary">Live</span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-body-sm text-on-surface-variant font-medium uppercase tracking-wider mb-1">
                          {new Date(ride.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2 text-title-md text-on-surface">
                          <span>{ride.origin.split(',')[0]}</span>
                          <ArrowRight size={14} className="text-outline" />
                          <span>{ride.destination.split(',')[0]}</span>
                        </div>
                      </div>
                      
                      {/* Cancel Kebab */}
                      {ride.status === 'SCHEDULED' && (
                        <button 
                          onClick={() => setRideToCancel(ride)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                          aria-label="Cancel Ride"
                        >
                          <MoreVertical size={20} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-body-sm mt-1">
                      <span className="text-on-surface-variant">Time: {new Date(ride.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-secondary font-semibold">₹{ride.farePerSeat}/seat</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {ride.status === 'SCHEDULED' ? (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStartRide(ride.id)}
                          isLoading={startingRideId === ride.id}
                        >
                          Start Ride →
                        </Button>
                      ) : ride.status === 'ACTIVE' ? (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleCompleteRide(ride.id)}
                          isLoading={completingRideId === ride.id}
                        >
                          <Check size={16} /> Complete Ride
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* Expand Toggle */}
                  <div 
                    className="border-t border-outline-variant/20 px-4 py-2.5 bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
                    onClick={() => handleToggleExpand(ride.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-label-md text-on-surface font-semibold">{bookedSeats}/{ride.totalSeats} Seats Booked</span>
                      {pendingCount > 0 && (
                        <span className="bg-error text-white text-[10px] font-bold px-1.5 rounded-full">{pendingCount} pending</span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-on-surface-variant" /> : <ChevronDown size={16} className="text-on-surface-variant" />}
                  </div>

                  {/* Expanded Bookings List */}
                  {isExpanded && (
                    <div className="bg-surface-dim/30 p-2 border-t border-outline-variant/20">
                      {bookings.length === 0 ? (
                        <p className="text-body-sm text-center text-on-surface-variant py-4">No bookings yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {bookings.map(booking => (
                            <div key={booking.id} className="bg-surface-container rounded-xl p-3 flex items-center justify-between border border-outline-variant/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden flex items-center justify-center text-on-surface-variant font-bold text-label-lg">
                                  {booking.rider?.profilePhotoUrl ? (
                                    <img src={booking.rider.profilePhotoUrl} alt="Rider" className="w-full h-full object-cover" />
                                  ) : (
                                    (booking.rider?.name || booking.riderName || '?').charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-title-md text-on-surface leading-tight">{booking.rider?.name || booking.riderName || 'Rider'}</span>
                                  <span className="text-label-sm text-on-surface-variant uppercase mt-0.5">{booking.status}</span>
                                </div>
                              </div>
                              
                              {booking.status === 'PENDING' ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleBookingAction(booking.id, 'accept', ride.id)} className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center hover:bg-secondary-container/40">
                                    <Check size={16} />
                                  </button>
                                  <button onClick={() => handleBookingAction(booking.id, 'reject', ride.id)} className="w-8 h-8 rounded-full bg-error-container/20 text-error flex items-center justify-center hover:bg-error-container/40">
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : booking.status === 'CONFIRMED' ? (
                                <button onClick={() => onOpenChat(booking.id)} className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant text-primary flex items-center justify-center">
                                  <MessageSquare size={14} />
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CancelConfirmModal
        isOpen={!!rideToCancel}
        onClose={() => { setRideToCancel(null); setCancelReturnTrip(false); }}
        onConfirm={handleCancelRide}
        title="Cancel Ride?"
        message={`${(rideToCancel?.totalSeats || 0) - (rideToCancel?.availableSeats || 0)} riders will be notified about cancellation.`}
        confirmText="Yes, Cancel Ride"
        returnTripDetails={findReturnRide(rideToCancel) ? `${findReturnRide(rideToCancel).origin.split(',')[0]} to ${findReturnRide(rideToCancel).destination.split(',')[0]} on ${new Date(findReturnRide(rideToCancel).departureTime).toLocaleDateString()}` : null}
        cancelReturnTrip={cancelReturnTrip}
        onCancelReturnTripChange={setCancelReturnTrip}
      />
    </div>
  );
}

