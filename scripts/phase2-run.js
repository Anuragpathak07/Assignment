// Phase 2 NodeJS helper script
// ---------------------------------------------
// This script exists to satisfy the "NodeJS based script/project"
// requirement from the assignment. It orchestrates Phase 2 by
// talking to the existing Flask backend APIs.
//
// What it does:
// 1. Fetches articles from the Flask CRUD API
// 2. Picks either:
//    - a specific article id passed via CLI, or
//    - all "original" articles if no id is given
// 3. For each selected article, calls the /rewrite/:id endpoint
//    which:
//      - Searches the title on Google (via Serper)
//      - Scrapes the first 2 blog/article links
//      - Calls the Cohere LLM to rewrite the content
//      - Saves the updated article via the CRUD API
//
// Usage:
//   # Rewrite ALL original articles
//   node scripts/phase2-run.js
//
//   # Rewrite a single article by id
//   node scripts/phase2-run.js 3
//
// Configuration:
//   BACKEND_BASE_URL (optional env var)
//   Defaults to: http://127.0.0.1:5000/api

import axios from "axios";

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL || "http://127.0.0.1:5000/api";

async function fetchArticles() {
  const url = `${BACKEND_BASE_URL}/articles/`;
  console.log(`[Phase2] Fetching articles from: ${url}`);
  const res = await axios.get(url);
  return res.data;
}

async function rewriteArticle(id) {
  const url = `${BACKEND_BASE_URL}/rewrite/${id}`;
  console.log(`[Phase2] Rewriting article id=${id} via: ${url}`);
  const res = await axios.post(url);
  return res.data;
}

async function main() {
  try {
    console.log("=== Phase 2 Orchestrator (NodeJS) ===");
    console.log(`Backend base URL: ${BACKEND_BASE_URL}`);

    const [, , argId] = process.argv;

    const articles = await fetchArticles();
    if (!Array.isArray(articles) || articles.length === 0) {
      console.error(
        "[Phase2] No articles found. Please run the scraping flow first (e.g., via frontend or POST /api/articles/scrape).",
      );
      process.exit(1);
    }

    let targets;

    if (argId) {
      const idNum = Number(argId);
      if (Number.isNaN(idNum)) {
        console.error(
          `[Phase2] Invalid article id "${argId}". Please pass a numeric id or omit to process all originals.`,
        );
        process.exit(1);
      }
      const match = articles.find((a) => a.id === idNum);
      if (!match) {
        console.error(
          `[Phase2] Article with id=${idNum} not found in API response.`,
        );
        process.exit(1);
      }
      targets = [match];
      console.log(
        `[Phase2] Will rewrite single article id=${match.id} :: "${match.title}"`,
      );
    } else {
      targets = articles.filter((a) => a.type === "original");
      if (targets.length === 0) {
        console.error(
          "[Phase2] No original articles found to rewrite (only updated articles exist).",
        );
        process.exit(1);
      }
      console.log(
        `[Phase2] Found ${targets.length} original article(s) to rewrite.`,
      );
    }

    for (const article of targets) {
      console.log(
        `\n[Phase2] >>> Rewriting article #${article.id}: "${article.title}"`,
      );
      try {
        const updated = await rewriteArticle(article.id);
        console.log(
          `[Phase2] Created updated article #${updated.id}: "${updated.title}"`,
        );
        if (Array.isArray(updated.references) && updated.references.length) {
          console.log("[Phase2] References:");
          for (const ref of updated.references) {
            console.log(`  - ${ref}`);
          }
        }
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Unknown error occurred";
        console.error(
          `[Phase2] Failed to rewrite article id=${article.id}: ${msg}`,
        );
      }
    }

    console.log("\n[Phase2] Done.");
  } catch (err) {
    console.error("[Phase2] Fatal error:", err?.message || err);
    process.exit(1);
  }
}

main();


