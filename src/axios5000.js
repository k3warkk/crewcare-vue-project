import axios from "axios";

const axios5000 = axios.create({
    baseURL: "http://192.168.254.137:5000",
});

// Axios instance for the Flask server on port 5000
export default axios5000;
