const articles = require("./articles.json");

const API_URL = "http://localhost:8000/api/articles";

const COOKIE_STRING = "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwiZW1haWwiOiJ4aGFkeWF5YW5AZ21haWwuY29tIiwibmFtZSI6InhoYWR5IGF5YW4iLCJpbWFnZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zdG9yYWdlL3VzZXJzL3VzZXJfMTc3MDU1NzQ0MjQwN182Nmo0ZmF1aS5qcGVnIiwiaWF0IjoxNzcwNzI5MjgwLCJleHAiOjE3NzA3MzAxODB9.cEBUZGfGnsTknAGhRaPyMVRPK4YieixbZYmkXLEK_UM"
async function sendArticles() {
  for (const article of articles) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": COOKIE_STRING
        },
        body: JSON.stringify(article),
        credentials: "include"
      });

      const data = await res.json();
      console.log(`✅ Sent: ${article.title}`, res.status);
    } catch (err) {
      console.error(` Failed: ${article.title}`, err);
    }
  }

  console.log("🚀 Done");
}

sendArticles();
