import axiosInstance from './axiosInstance';

export const getComments = async (bugId) => {
  const res = await axiosInstance.get(`/bugs/${bugId}/comments`);
  return res.data;
};

export const addComment = async (bugId, text) => {
  const res = await axiosInstance.post(`/bugs/${bugId}/comments`, { text });
  return res.data;
};

export const deleteComment = async (bugId, commentId) => {
  const res = await axiosInstance.delete(`/bugs/${bugId}/comments/${commentId}`);
  return res.data;
};
