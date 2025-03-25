import api from './api';

export const getBrands = async (params = {}) => {
  const response = await api.get("brand", { 
    params: {
      includeDisabled: true, // O false según lo necesites
      ...params
    }
  });
  return response;
};

export const getBrandById = async (id) => {
const response = await api.get(`brand/${id}`);
return response;
};

export const createBrand = async (category) => {
  const response = await api.post("brand", category);
  return response;
};

export const updateBrand = async (id, category) => {
  const response = await api.put(`brand/${id}`, category);
  return response;
};

export const toggleBrandStatus = async (id) => {
  const response = await api.put(`brand/toggle/${id}`);
  return response;
};

export const deleteBrand = async (id) => {
  const response = await api.delete(`brand/${id}`)
  return response
};