import axios from "axios";

// const baseURL = process.env.REACT_APP_FUNCTIONS_URL+ "/"

// const baseURL = 'http://samco-jed-ap02/dashboard_be/'
//const baseURL = "http://localhost:8080";
const baseURL = "https://lazy-rose-coati-tie.cyclic.app"

export const axiosInstance = axios.create({
    baseURL: baseURL,
});
