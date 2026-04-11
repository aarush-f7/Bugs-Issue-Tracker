import axiosInstance from './axiosInstance';

export const getDashboardStats = async () => {
  const res = await axiosInstance.get('/dashboard/stats');
  return res.data;
};

export const getProjectStats = async (projectId) => {
  const res = await axiosInstance.get(`/dashboard/project/${projectId}`);
  return res.data;
};
