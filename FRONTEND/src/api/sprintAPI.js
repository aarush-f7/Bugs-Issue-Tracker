import axiosInstance from './axiosInstance';

export const getAllSprints = async () => {
  const res = await axiosInstance.get('/sprints');
  return res.data;
};

export const createSprint = async (data) => {
  const res = await axiosInstance.post('/sprints', data);
  return res.data;
};

export const getSprintById = async (id) => {
  const res = await axiosInstance.get(`/sprints/${id}`);
  return res.data;
};

export const updateSprint = async (id, data) => {
  const res = await axiosInstance.put(`/sprints/${id}`, data);
  return res.data;
};

export const deleteSprint = async (id) => {
  const res = await axiosInstance.delete(`/sprints/${id}`);
  return res.data;
};
