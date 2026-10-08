import api from './api';

export const startRide = (rideId) => 
  api.put(`/rides/${rideId}/start`);

export const completeRide = (rideId) => 
  api.put(`/rides/${rideId}/complete`);

export const cancelRide = (rideId) => 
  api.put(`/rides/${rideId}/cancel`);
