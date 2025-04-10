import axios from 'axios';

export const getTimeSlots = async () => {
  const response = await axios.get('/api/timeslots/');
  return response.data;
};