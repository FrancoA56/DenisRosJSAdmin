import api from "./api";

export const login = async (credentials) => {
  const response = await api.post("/user/login", credentials);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const register = async (userData) => {
  const response = await api.post("/user/register", userData);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get("/user", { params });
  return response.data;
};

export const changeUserRol = async (userId, data) => {
  const response = await api.put(`/user/role/${userId}`, data);
  return response.data;
};

export const editUser = async (id, userData) => {
  const response = await api.put(`/user/${id}`, userData);
  return response.data;
};

export const toggleUser = async (id) => {
  const response = await api.put(`/user/toggle/${id}`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/user/delete/${id}`)
  return response.data
}
