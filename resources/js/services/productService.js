import api from './api';

export const productService = {
    getAll: async (params, config) =>
        api.get('/products', { params, ...config }),

    getById: async (id, config) =>
        api.get(`/products/${id}`, config),

    getFeatured: async (config) =>
        api.get('/products/featured', config),

    getHotDeals: async (config) =>
        api.get('/products/hot-deals', config),

    getPremium: async (config) =>
        api.get('/products/premium', config),

    getByCategory: async (categoryId, params, config) =>
        api.get(`/products/category/${categoryId}`, { params, ...config }),

    checkStock: async (id, config) =>
        api.get(`/products/${id}/stock`, config),

    search: async (query, config) =>
        productService.getAll({ search: query }, config),
};

export default productService;
