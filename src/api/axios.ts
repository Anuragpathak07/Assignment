import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ECONNREFUSED" || error.message.includes("Network Error")) {
      console.error("[API] Connection refused. Is the backend server running on http://127.0.0.1:5000?");
      error.message = "Cannot connect to backend server. Please ensure the backend is running.";
    } else if (error.response) {
      // Server responded with error status
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    } else {
      console.error("[API] Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export interface Article {
  id: number;
  title: string;
  content: string;
  source_url: string | null;
  type: "original" | "updated";
  references: string[];
}

// API functions
export const fetchArticles = async (): Promise<Article[]> => {
  const response = await api.get<Article[]>("/articles/");
  return response.data;
};

export const fetchArticleById = async (id: string | number): Promise<Article> => {
  const response = await api.get<Article>(`/articles/${id}`);
  return response.data;
};

export const rewriteArticle = async (id: string | number): Promise<Article> => {
  const response = await api.post<Article>(`/rewrite/${id}`);
  return response.data;
};

export const scrapeArticles = async (): Promise<{ message: string; scraped: number; added: number; skipped: number }> => {
  const response = await api.post<{ message: string; scraped: number; added: number; skipped: number }>("/articles/scrape");
  return response.data;
};

export default api;
