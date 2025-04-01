import api from "./api";

export const getCategories = async () => {
  try {
    const response = await api.get("category", {
      params: {
        includeDisabled: true,
      },
    });
    return response.data; // Asegúrate que devuelve un array
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Devuelve array vacío en caso de error
  }
};

export const getCategoriesAble = async () => {
  try {
    const response = await api.get("category", {
      params: {
        includeDisabled: false,
      },
    });
    return response.data; // Asegúrate que devuelve un array
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Devuelve array vacío en caso de error
  }
};

export const getCategoryById = async (id) => {
  const response = await api.get(`category/${id}`);
  return response;
};

export const createCategory = async (category) => {
  const response = await api.post("category", category);
  return response;
};

export const updateCategory = async (id, category) => {
  const response = await api.put(`category/${id}`, category);
  return response;
};

export const toggleCategoryStatus = async (id) => {
  const response = await api.put(`category/toggle/${id}`);
  return response;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`category/${id}`);
  return response;
};
