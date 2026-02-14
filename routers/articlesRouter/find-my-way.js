const http = require("http");
const FindMyWay = require("find-my-way");
const {
  getAllArticles
} = require("../../controllers/articlesController/articles.controller");

const zlib = require("zlib");

function withCompression(handler) {
  return (req, res, params) => {
    const acceptEncoding = req.headers["accept-encoding"] || "";

    if (acceptEncoding.includes("gzip")) {
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");

      const gzip = zlib.createGzip();
      gzip.pipe(res);

      // Monkey patch res.end & res.write
      const originalWrite = res.write.bind(res);
      const originalEnd = res.end.bind(res);

      res.write = (chunk) => gzip.write(chunk);
      res.end = (chunk) => {
        if (chunk) gzip.write(chunk);
        gzip.end();
      };

      handler(req, res, params);
    } else {
      handler(req, res, params);
    }
  };
}


// Create the router
const router = FindMyWay({
  defaultRoute: (req, res) => {
    res.statusCode = 404;
    res.end("Not Found");
  },
});


// Register routes
router.on("GET", "/api/articles", getAllArticles);
        
// Create the server
const server = http.createServer((req, res) => {
  router.lookup(req, res);  // find-my-way handles the routing
});

server.listen(9000, () => console.log("Server running on port 9000"));
