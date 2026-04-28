import api from './api';

const notificationService = {
    getNotifications: (params, config) =>
        api.get('/notifications', { params, timeout: 12000, ...config }),

    markAsRead: (id, config) =>
        api.patch(`/notifications/${id}/read`, {}, { timeout: 12000, ...config }),

    markAllAsRead: (config) =>
        api.post('/notifications/read-all', {}, { timeout: 12000, ...config }),
};

export default notificationService;
