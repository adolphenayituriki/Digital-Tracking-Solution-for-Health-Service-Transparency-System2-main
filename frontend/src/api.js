import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // Change to your backend URL if needed
});

export default API;