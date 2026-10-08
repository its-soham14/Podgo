import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, IndianRupee } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import StarRating from '../components/rating/StarRating';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import RatingModal from '../components/rating/RatingModal';

export default function TripHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('ALL');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingToRate, setBookingToRate] = useState(null);

  const fetchTrips = async () => {
    try {
      const [riderRes, driverRes] = await Promise.all([
        api.get('/bookings/rider'),
        api.get('/rides/driver')
      ]);
      
      const riderTrips = riderRes.data.data.map(b => ({
        ...b,
        tripRole: 'RIDER',
        date: new Date(b.ride.departureTime)
      }));
      
      const driverTrips = driverRes.data.data.map(r => ({
        ...r,
        tripRole: 'DRIVER',
        date: new Date(r.departureTime)
      }));
      
      const allTrips = [...riderTrips, ...driverTrips]
        .sort((a, b) => b.date - a.date);
        
      setTrips(allTrips);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(t => {
    if (filter === 'ALL') return true;
    return t.tripRole === filter;
  });

  const completedCount = trips.filter(t => t.status === 'COMPLETED').length;
  const moneyExchanged = trips.reduce((acc, t) => {
    if (t.status === 'COMPLETED') {
      if (t.tripRole === 'RIDER') return acc + t.fareAmount;
      if (t.tripRole === 'DRIVER') return acc + (t.farePerSeat * (t.totalSeats - t.availableSeats));
    }
    return acc;
  }, 0);

  const groupByMonth = (tripList) => {
    return tripList.reduce((acc, trip) => {
      const monthYear = trip.date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(trip);
      return acc;
    }, {});
  };

  const groupedTrips = groupByMonth(filteredTrips);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">My Trips</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <p className="text-[var(--text-muted)] text-[11px] font-semibold uppercase tracking-wider mb-1">Total Trips</p>
            <p className="font-display font-bold text-2xl text-[var(--text-primary)]">{completedCount}</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
            <p className="text-[var(--text-muted)] text-[11px] font-semibold uppercase tracking-wider mb-1">Money Exchanged</p>
            <p className="font-display font-bold text-2xl text-[var(--color-success-500)] flex items-center">
              <IndianRupee size={20} />{moneyExchanged}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', 'RIDER', 'DRIVER'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-[var(--color-primary-500)] text-white shadow-md' 
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
            >
              {f === 'ALL' ? 'All Trips' : `As ${f.charAt(0) + f.slice(1).toLowerCase()}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-[var(--bg-surface)] animate-pulse rounded-2xl border border-[var(--border)]"></div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
              <Clock size={32} />
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">No trips yet</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-[250px]">You haven't completed any trips with PodGo yet.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-[var(--color-primary-500)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Find your first ride
            </button>
          </div>
        ) : (
          Object.entries(groupedTrips).map(([month, monthTrips]) => (
            <div key={month} className="mb-8">
              <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 pl-1">{month}</h3>
              <div className="space-y-4">
                {monthTrips.map(trip => (
                  <div key={trip.tripRole + trip.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${
                        trip.status === 'COMPLETED' ? 'bg-[var(--color-success-500)]/10 text-[var(--color-success-600)] border-[var(--color-success-500)]/20' :
                        trip.status === 'CANCELLED' ? 'bg-[var(--color-danger-500)]/10 text-[var(--color-danger-600)] border-[var(--color-danger-500)]/20' :
                        'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)] border-[var(--color-primary-500)]/20'
                      }`}>
                        {trip.status === 'COMPLETED' ? '✅ COMPLETED' : trip.status}
                      </div>
                      <span className="text-[12px] font-medium text-[var(--text-muted)]">
                        {trip.date.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-[15px] text-[var(--text-primary)]">
                        {(trip.tripRole === 'RIDER' ? trip.ride.origin : trip.origin).split(',')[0]} → {(trip.tripRole === 'RIDER' ? trip.ride.destination : trip.destination).split(',')[0]}
                      </h4>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                        {trip.tripRole === 'RIDER' 
                          ? `Driver: ${trip.ride.driverName}` 
                          : `${trip.totalSeats - trip.availableSeats} riders`}
                      </p>
                    </div>

                    <div className="flex justify-between items-end border-t border-[var(--border)] pt-3">
                      <div>
                        {trip.tripRole === 'RIDER' ? (
                          <p className="text-[13px] text-[var(--text-secondary)] font-medium">
                            ₹{trip.fareAmount} paid
                          </p>
                        ) : (
                          <p className="text-[13px] text-[var(--color-success-500)] font-medium">
                            ₹{trip.farePerSeat * (trip.totalSeats - trip.availableSeats)} recovered
                          </p>
                        )}
                        
                        {trip.tripRole === 'RIDER' && trip.status === 'COMPLETED' && trip.hasRated && (
                          <div className="mt-1 flex items-center gap-1 opacity-70">
                            <StarRating value={5} readonly size={12} />
                            <span className="text-[11px] text-[var(--text-muted)]">Rated</span>
                          </div>
                        )}
                      </div>
                      
                      {trip.tripRole === 'RIDER' && trip.status === 'COMPLETED' && !trip.hasRated && (
                        <button 
                          onClick={() => setBookingToRate(trip)}
                          className="text-[13px] font-semibold text-[var(--color-accent-500)] hover:underline"
                        >
                          ⭐ Rate Driver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <RatingModal
        isOpen={!!bookingToRate}
        onClose={() => setBookingToRate(null)}
        booking={bookingToRate}
        onSubmitted={() => {
          setBookingToRate(null);
          setLoading(true);
          setTrips([]);
          fetchTrips();
        }}
      />
    </div>
  );
}
