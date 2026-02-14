const FindMyWay = require('find-my-way');
const { parse } = require('url');

function createFindMyWayFromExpress(app) {
  const router = FindMyWay({
    defaultRoute: (req, res) => {
      res.statusCode = 404;
      res.end('Not Found');
    },
  });

  const stack = app._router?.stack || []; // <-- safe check
  stack.forEach((layer) => {
    if (!layer.route && !layer.name === 'router') return;

    // If it's a router, dig deeper
    if (layer.handle.stack) {
      layer.handle.stack.forEach((subLayer) => {
        if (!subLayer.route) return;

        const path = subLayer.route.path;
        const methods = Object.keys(subLayer.route.methods);

        methods.forEach((method) => {
          router.on(method.toUpperCase(), path, async (req, res, params) => {
            req.params = params;

            // parse query
            const parsed = parse(req.url, true);
            req.query = parsed.query;

            // parse JSON body
            req.body = await new Promise((resolve) => {
              if (req.method === 'GET' || req.method === 'DELETE') return resolve({});
              let body = '';
              req.on('data', (chunk) => (body += chunk));
              req.on('end', () => {
                try {
                  resolve(JSON.parse(body || '{}'));
                } catch {
                  resolve({});
                }
              });
            });

            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };

            // call all handlers
            for (const handler of subLayer.route.stack.map((h) => h.handle)) {
              try {
                await handler(req, res);
              } catch (err) {
                console.error('Handler error:', err);
                res.statusCode = 500;
                res.end('Internal Server Error');
              }
            }
          });
        });
      });
    }
  });

  return router;
}

module.exports = createFindMyWayFromExpress;
