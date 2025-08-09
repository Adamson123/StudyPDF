import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || `${location.origin}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
