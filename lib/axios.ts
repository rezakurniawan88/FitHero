import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://fithero-backend-api.vercel.app",
    withCredentials: true,
})
export default axiosInstance;