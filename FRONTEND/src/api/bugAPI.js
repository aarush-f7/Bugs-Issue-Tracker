import axiosInstance from './axiosInstance';

export const getAllBugs = async (params = {}) => {
  const res = await axiosInstance.get('/bugs', { params });
  return res.data;
};

export const createBug = async (data) => {
  const res = await axiosInstance.post('/bugs', data);
  return res.data;
};

export const getBugById = async (id) => {
  const res = await axiosInstance.get(`/bugs/${id}`);
  return res.data;
};

export const updateBug = async (id, data) => {
  const res = await axiosInstance.put(`/bugs/${id}`, data);
  return res.data;
};

export const deleteBug = async (id) => {
  const res = await axiosInstance.delete(`/bugs/${id}`);
  return res.data;
};

export const updateBugStatus = async (id, status) => {
  const res = await axiosInstance.patch(`/bugs/${id}/status`, { status });
  return res.data;
};

export const assignBug = async (id, assignedTo) => {
  const res = await axiosInstance.patch(`/bugs/${id}/assign`, { assignedTo });
  return res.data;
};

export const getAssignedToMe = async () => {
  const res = await axiosInstance.get('/bugs/assigned/me');
  return res.data;
};

export const getReportedByMe = async () => {
  const res = await axiosInstance.get('/bugs/reported/me');
  return res.data;
};
