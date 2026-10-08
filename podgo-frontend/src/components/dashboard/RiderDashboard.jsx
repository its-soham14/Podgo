import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Search, MessageSquare, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import CancelConfirmModal from '../common/CancelConfirmModal';
import RatingModal from '../rating/RatingModal';
import Button from '../common/Button';

export default function RiderDashboard({ onOpenChat }) {
  const { user } = useAuthStore();
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReturnTrip, setCancelReturnTrip] = useState(false);
  const [bookingToRate, setBookingToRate] = useState(null);

  const { data: bookings = [], isLoading: loading, refetch: fetchBookings } = useQuery({
    queryKey: ['riderBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/rider');
      return res.data.data;
    }
  });

  const activeBookings = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));

  const findReturnBooking = (outboundBooking) => {
    if (!outboundBooking) return null;
    return activeBookings.find(b => 
      b.ride.driverId === outboundBooking.ride.driverId && 
      b.ride.id !== outboundBooking.ride.id &&
      new Date(b.ride.departureTime) > new Date(outboundBooking.ride.departureTime)
    );
  };

  const handleCancelBooking = async () => {
    try {
      if (cancelReturnTrip) {
        const returnBooking = findReturnBooking(bookingToCancel);
        if (returnBooking) {
          await api.put(`/bookings/${returnBooking.id}/cancel`);
        }
      }
      await api.put(`/bookings/${bookingToCancel.id}/cancel`);
      fetchBookings();
      setBookingToCancel(null);
      setCancelReturnTrip(false);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-secondary/10 text-secondary';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500';
      case 'CANCELLED': return 'bg-error/10 text-error';
      case 'COMPLETED': return 'bg-primary-container/20 text-primary-container';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <div className="flex flex-col px-4 gap-6">
      
      {/* Greeting Section */}
      <div className="flex flex-col items-start gap-1">
        <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
          Good morning, {user?.name?.split(' ')[0] || 'Rider'} 👋
        </h2>
        <p className="text-body-md text-on-surface-variant">Where do you want to go today?</p>
      </div>

      {/* Quick Action Cards - Find a Ride */}
      <div className="grid grid-cols-1 gap-3">
        <Link to="/find-ride" className="group rounded-xl overflow-hidden bg-surface-container p-6 min-h-[120px] cursor-pointer active:scale-[0.98] transition-transform relative block shadow-sm border border-outline-variant">
          
          {/* Faux Map Background / Illustration */}
          <div className="absolute inset-0 right-0 left-1/3 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent pointer-events-none mix-blend-multiply"></div>
          
          <div className="absolute top-1/2 -translate-y-1/2 right-16 text-primary flex items-end justify-center pointer-events-none drop-shadow-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>

          <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary shadow-sm border border-outline-variant/50">
            <Search size={22} />
          </div>

          <div className="flex flex-col h-full justify-center relative z-10">
            <span className="font-display text-headline-sm font-bold text-on-surface mb-1">Find a Ride</span>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Book a seat</span>
              <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Rides Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm font-bold text-on-surface">Upcoming Rides</h3>
          <Link to="/trips" className="text-label-md font-bold text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-8 flex flex-col items-center justify-center text-center shadow-sm">
            <Car size={40} className="text-on-surface-variant/50 mb-3" />
            <p className="text-title-md font-bold text-on-surface mb-1">No upcoming rides</p>
            <p className="text-body-sm text-on-surface-variant mb-6">You have no active bookings at the moment.</p>
            <button onClick={() => document.querySelector('a[href="/find-ride"]').click()} className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg active:scale-95 transition-transform shadow-sm">
              Search Rides
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="bg-surface rounded-xl border border-outline-variant/30 p-4 shadow-sm flex flex-col gap-3 relative">
                
                {/* Live Indicator inside card */}
                {booking.ride.status === 'ACTIVE' && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-surface-dim rounded-full border border-secondary/30 shadow-[0_0_10px_rgba(67,148,246,0.2)]">
                     <span className="animate-ping h-1.5 w-1.5 rounded-full bg-secondary"></span>
                     <span className="text-[10px] uppercase font-bold text-secondary">Ride in progress</span>
                  </div>
                )}

                {/* Top: Avatar, Driver Name, Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden flex items-center justify-center text-on-surface font-bold text-label-lg">
                      {booking.ride.driver?.profilePhotoUrl ? (
                        <img src={booking.ride.driver.profilePhotoUrl} alt="Driver" className="w-full h-full object-cover" />
                      ) : (
                        (booking.ride.driver?.name || booking.ride.driverName || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-title-md font-bold text-on-surface">{booking.ride.driver?.name || booking.ride.driverName || 'Driver'}</p>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide font-bold">
                        <span>⭐ {booking.ride.driverRating || 'New'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-0.5 rounded-full text-label-sm font-bold ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>

                {/* Route */}
                <div className="bg-surface-container-low rounded-lg p-3 mt-1 border border-outline-variant/20">
                  <div className="flex items-center gap-2 text-body-lg text-on-surface font-bold">
                    <span>{booking.ride.origin}</span>
                    <ArrowRight size={14} className="text-outline-variant" />
                    <span>{booking.ride.destination}</span>
                  </div>
                  <div className="text-body-sm font-medium text-on-surface-variant mt-1 flex items-center justify-between">
                    <span>{new Date(booking.ride.departureTime).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}</span>
                    <span className="text-primary font-bold text-price-display leading-none">
                      ₹{booking.ride.farePerSeat}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="ghost" size="sm" className="flex-1 border-outline-variant/40" onClick={() => setBookingToCancel(booking)}>
                    Cancel
                  </Button>
                  {(booking.status === 'CONFIRMED' || booking.ride.status === 'ACTIVE') && (
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => onOpenChat(booking.id)}>
                      <MessageSquare size={16} /> Chat
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CancelConfirmModal
        isOpen={!!bookingToCancel}
        onClose={() => { setBookingToCancel(null); setCancelReturnTrip(false); }}
        onConfirm={handleCancelBooking}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, Cancel"
        returnTripDetails={findReturnBooking(bookingToCancel) ? `${findReturnBooking(bookingToCancel).ride.origin.split(',')[0]} to ${findReturnBooking(bookingToCancel).ride.destination.split(',')[0]} on ${new Date(findReturnBooking(bookingToCancel).ride.departureTime).toLocaleDateString()}` : null}
        cancelReturnTrip={cancelReturnTrip}
        onCancelReturnTripChange={setCancelReturnTrip}
      />

      <RatingModal
        isOpen={!!bookingToRate}
        onClose={() => setBookingToRate(null)}
        booking={bookingToRate}
        onSubmitted={() => fetchBookings()}
      />
    </div>
  );
}

