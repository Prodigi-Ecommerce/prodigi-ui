import axios from "axios";

const projectsApiClient = axios.create({
  baseURL: import.meta.env.VITE_IMAGE_GEN_API_URL,
})


export default projectsApiClient;