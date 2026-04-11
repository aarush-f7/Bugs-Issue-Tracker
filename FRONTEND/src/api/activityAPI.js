import axiosInstance from './axiosInstance';

export const getBugActivity = async (bugId) => {
  const res = await axiosInstance.get(`/bugs/${bugId}/activity`);
  return res.data;
};
