import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',  // adjust this to your API's base URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log("token is ", token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;