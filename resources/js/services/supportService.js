import api from './api';

export const supportService = {
    submitInquiry: (data) => api.post('/support/inquiry', data),
    getInquiries: () => api.get('/support/inquiries'),
};

export default supportService;
