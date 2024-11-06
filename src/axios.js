import axios from "axios";
import router from "./router/index.js";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

axiosClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem(
        "userToken"
    )}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            router.push("/login");
            return error;
        }
        throw error;
    }
);

export default axiosClient;

export const axios5000 = axios.create({
    baseURL: "http://192.168.254.137:5000",
});
