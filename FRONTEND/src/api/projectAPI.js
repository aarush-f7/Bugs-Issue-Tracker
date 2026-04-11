import axiosInstance from './axiosInstance';

export const getAllProjects = async () => {
  const res = await axiosInstance.get('/projects');
  return res.data;
};

export const createProject = async (data) => {
  const res = await axiosInstance.post('/projects', data);
  return res.data;
};

export const getProjectById = async (id) => {
  const res = await axiosInstance.get(`/projects/${id}`);
  return res.data;
};

export const updateProject = async (id, data) => {
  const res = await axiosInstance.put(`/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await axiosInstance.delete(`/projects/${id}`);
  return res.data;
};

export const addProjectMember = async (id, members) => {
  const res = await axiosInstance.post(`/projects/${id}/members`, { members });
  return res.data;
};

export const removeProjectMember = async (id, userId) => {
  const res = await axiosInstance.delete(`/projects/${id}/members/${userId}`);
  return res.data;
};
