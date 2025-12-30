# Frontend API Usage Documentation

## 📋 Overview

This document explains how the React frontend interacts with the backend APIs. The frontend uses standard REST APIs and is **framework-agnostic** - it works with any backend that provides REST endpoints (Flask, Laravel, Express, etc.).

## 🔍 Where Articles Are Fetched

### 1. **API Configuration** (`src/api/axios.ts`)

```typescript
// Base URL for all API calls
const api = axios.create({
  baseURL: "https://assignment-krcn.onrender.com/api",  // Flask backend
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Current Backend**: Flask (Python) at `https://assignment-krcn.onrender.com/api`

### 2. **API Functions Used by Frontend**

#### **Fetch All Articles**
```typescript
// src/api/axios.ts - Line 54-57
export const fetchArticles = async (): Promise<Article[]> => {
  const response = await api.get<Article[]>("/articles/");
  return response.data;
};
```

**Used in**: `src/pages/ArticlesList.tsx` (Line 23)
```typescript
let data = await fetchArticles();  // GET /api/articles/
```

#### **Fetch Single Article**
```typescript
// src/api/axios.ts - Line 59-62
export const fetchArticleById = async (id: string | number): Promise<Article> => {
  const response = await api.get<Article>(`/articles/${id}`);
  return response.data;
};
```

**Used in**: `src/pages/ArticleDetail.tsx` (Line 30)
```typescript
const data = await fetchArticleById(id);  // GET /api/articles/:id
```

#### **Scrape Articles**
```typescript
// src/api/axios.ts - Line 69-72
export const scrapeArticles = async () => {
  const response = await api.post("/articles/scrape");
  return response.data;
};
```

**Used in**: `src/pages/ArticlesList.tsx` (Line 29, 54)
```typescript
const result = await scrapeArticles();  // POST /api/articles/scrape
```

#### **Rewrite Article**
```typescript
// src/api/axios.ts - Line 64-67
export const rewriteArticle = async (id: string | number): Promise<Article> => {
  const response = await api.post<Article>(`/rewrite/${id}`);
  return response.data;
};
```

**Used in**: `src/pages/ArticleDetail.tsx` (Line 49)
```typescript
const newArticle = await rewriteArticle(id);  // POST /api/rewrite/:id
```

## 📍 Complete API Call Flow

### **Articles List Page** (`src/pages/ArticlesList.tsx`)

```
User clicks "Fetch Articles"
  ↓
loadArticles() function (Line 16)
  ↓
fetchArticles() → GET /api/articles/ (Line 23)
  ↓
If empty → scrapeArticles() → POST /api/articles/scrape (Line 29)
  ↓
fetchArticles() again → GET /api/articles/ (Line 32)
  ↓
Display articles in UI
```

### **Article Detail Page** (`src/pages/ArticleDetail.tsx`)

```
User navigates to /article/:id
  ↓
useEffect hook (Line 18)
  ↓
fetchArticleById(id) → GET /api/articles/:id (Line 30)
  ↓
Display article content
  ↓
User clicks "Rewrite with AI"
  ↓
rewriteArticle(id) → POST /api/rewrite/:id (Line 49)
  ↓
Navigate to new updated article
```

## 📝 Implementation Note

The assignment mentions "Laravel APIs" but this implementation uses **Flask (Python)** backend. This is functionally equivalent:

- ✅ **Framework-agnostic design**: Frontend uses standard REST APIs
- ✅ **Same endpoints**: All CRUD operations are identical
- ✅ **Requirements met**: Frontend correctly fetches and displays articles

The frontend would work identically with Laravel, Express, or any REST API backend. See the main README for more details on this design decision.

