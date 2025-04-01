import api from "./api";

// En services/products.js
export const getAllProducts = async () => {
  try {
    const response = await api.get("/product");
    return response.data?.products || []; // Asegura array vacío si no hay datos
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Devuelve array vacío en caso de error
  }
};
export const getProductById = async (id) => {
  const response = await api.get(`/product/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/product", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/product/${id}`, productData);
  return response.data;
};

export const toggleProductStatus = async (id) => {
  const response = await api.put(`/product/toggle/${id}`);
  return response;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/product/${id}`);
  return response;
};
