import api from './api';

export const categoryService = {
    getAll: async (config) =>
        api.get('/categories', config),

    getById: async (id, config) =>
        api.get(`/categories/${id}`, config),
};

export default categoryService;
