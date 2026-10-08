import api from './api';

export const submitRating = (data) => 
  api.post('/ratings', data);

export const getUserRatings = (userId) => 
  api.get(`/ratings/user/${userId}`);
