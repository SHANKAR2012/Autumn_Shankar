import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token'); // Make sure this is populated correctly
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
