import axios from 'axios';

export const getTimeSlots = async () => {
  const response = await axios.get('/api/time-slots/');
  return response.data;
};