import axiosInstance from './axiosInstance';

export const getAllUsers = async () => {
  const res = await axiosInstance.get('/users');
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
};
