import axios from 'axios';

const resolveApiBaseUrl = () => {
    const envBaseUrl = String(process.env.MIX_API_BASE_URL || '').trim();
    const currentHost = String(window.location.hostname || '').trim().toLowerCase();
    const isLoopbackHost = (host) => host === 'localhost' || host === '127.0.0.1';
    const isLocalDevHost = isLoopbackHost(currentHost);
    const currentPort = String(window.location.port || '');

    // When the app is already loaded from loopback on port 8000, keep API
    // calls on the same origin to avoid localhost/127.0.0.1 mismatches.
    if (isLocalDevHost && currentPort === '8000') {
        return `${window.location.origin}/api`;
    }

    if (envBaseUrl) {
        try {
            const parsed = new URL(envBaseUrl);
            const envHost = String(parsed.hostname || '').trim().toLowerCase();

            // Ignore loopback env URLs when the app is opened from a different host/IP.
            // This prevents long timeouts to the wrong machine on refresh.
            if (!(isLoopbackHost(envHost) && !isLoopbackHost(currentHost))) {
                return envBaseUrl.replace(/\/+$/, '');
            }
        } catch {
            return envBaseUrl.replace(/\/+$/, '');
        }
    }

    if (isLocalDevHost) {
        if (currentPort !== '8000') {
            return `${window.location.protocol}//${currentHost}:8000/api`;
        }
    }

    return `${window.location.origin}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
            // Clear token and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
