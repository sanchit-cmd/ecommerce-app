import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://savermart.in';

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const categoryService = {
  // Get all active categories
  getAllCategories: async () => {
    try {
      console.log('Making request to:', `${API_URL}/api/categories`);
      const response = await axios.get(`${API_URL}/api/categories`);
      console.log('Categories API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string) => {
    const response = await axios.get(`${API_URL}/api/categories/${slug}`);
    return response.data;
  },

  // Get subcategories for a category
  getSubcategories: async (slug: string) => {
    const response = await axios.get(`${API_URL}/api/categories/${slug}/subcategories`);
    return response.data;
  },

  // Get products by subcategory
  getProductsBySubcategory: async (categorySlug: string, subcategorySlug: string, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_URL}/api/products/category/${subcategorySlug}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

export const productService = {
  // Get all products with pagination and filters
  getAllProducts: async (params: { 
    search?: string;
    page?: number;
    limit?: number;
    category?: string;
  } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);

      const response = await axios.get(`${API_URL}/api/products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await axios.get(`${API_URL}/api/products/featured`);
    return response.data;
  },

  // Get product by ID or slug
  getProduct: async (idOrSlug: string) => {
    const response = await axios.get(`${API_URL}/api/products/${idOrSlug}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categorySlug: string, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_URL}/api/products/category/${categorySlug}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (productId: string) => {
    const response = await axios.get(`${API_URL}/api/products/${productId}/related`);
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_URL}/api/products/search?query=${query}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get recommended products
  getRecommendedProducts: async (cartItems: any[], userId?: string) => {
    const authHeader = await getAuthHeader();
    const response = await axios.post(
      `${API_URL}/api/products/recommended`,
      { cartItems, userId },
      authHeader
    );
    return response.data;
  },
}; 