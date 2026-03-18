import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

/* ---------- PROJECTS ---------- */

export const getProjects = async () => {
  const res = await API.get("/projects");
  return res.data;
};

export const createProject = async (data) => {
  const res = await API.post("/projects", data);
  return res.data;
};

/* ---------- TASKS ---------- */

export const getTasks = async () => {
  const res = await API.get("/tasks");
  return res.data;
};

export const createTask = async (task) => {
  const res = await API.post("/tasks", task);
  return res.data;
};

export default API;