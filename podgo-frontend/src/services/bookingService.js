import api from './api';

export const cancelBooking = (bookingId) =>
  api.put(`/bookings/${bookingId}/cancel`);
