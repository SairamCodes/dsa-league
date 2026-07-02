import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://your-backend.onrender.com/api",
  headers: {
    Accept: "application/json",
  },
});

const token = Cookies.get("dsa_league_token");

if (token) {
  client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
}

export default client;