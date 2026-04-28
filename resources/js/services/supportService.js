import api from './api';

export const supportService = {
    getConcerns: (params, config) =>
        api.get('/customer-concerns', { params, timeout: 12000, ...config }),

    submitConcern: (data, config) =>
        api.post(
            '/customer-concerns',
            {
                subject: data?.subject || 'General support request',
                message: data?.message || '',
                name: data?.name,
                email: data?.email,
            },
            { timeout: 12000, ...config }
        ),

    submitInquiry: (data, config) =>
        supportService.submitConcern(data, config),

    getInquiries: (params, config) =>
        supportService.getConcerns(params, config),
};

export default supportService;
