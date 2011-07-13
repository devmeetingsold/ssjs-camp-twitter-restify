var http = require('http'),
	cors = require('./cors');

http.createServer(function (req, res) {
	cors(req, res);
	res.writeHead(200, {
		'Content-Type': 'text/plain; charset=UTF-8'
	});
	req.end();

	console.log(
		req.method,
		req.url,
		req.headers
	);

	console.log('Request to 8080');
}).listen(8080, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8080/');

