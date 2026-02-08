const articles = require("./articles.json");

const API_URL = "http://localhost:8000/api/articles";

const COOKIE_STRING = "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IkFkbWluIiwiZW1haWwiOiJmYWtlcnNiZUBnbWFpbC5jb20iLCJuYW1lIjoiamFuIHh4bGJiYiIsImltYWdlIjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3N0b3JhZ2UvdXNlcnMvdXNlcl8xNzcwMTE2OTEzNTU4X293N3R3dG93LmpwZWciLCJpYXQiOjE3NzA0NzQ3MDksImV4cCI6MTc3MTA3OTUwOX0.3GeYKd9xA4awB8nOV2Xeu_RXiMXk8qyC5LmxYSJyaYo";

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
      console.error(`❌ Failed: ${article.title}`, err);
    }
  }

  console.log("🚀 Done");
}

sendArticles();
