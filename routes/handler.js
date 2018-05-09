var express = require('express');
var router = express.Router();
var https = require('https');
var http = require('http');
var url = require('url');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.redirect('/');
});

function queryURL(link, count, res) {
	if(count < 5) {
		var parse = url.parse(link);

		var conn = https;

		if(!parse.protocol || parse.protocol.indexOf('https') < 0) {
			conn = http;
		}

		conn.get(link, function(resp) {
			var headers = resp.headers;

			if(resp.statusCode < 300) {
				var xframe = (headers['x-frame-options'] || 'wtf').toLowerCase();

				if(xframe == 'deny' || xframe == 'sameorigin' || xframe.indexOf('allow-from') >= 0) res.send('false');
				else res.send('true');
			} else if(resp.statusCode < 400 && headers['location']) {
				queryURL(headers['location'], count + 1, res);
			} else {
				res.send('false');
			}
		});

		
	} else res.send('false');
}

router.get('/urlcheck', function(req, res, next) {
	if(req.query.url) {
		queryURL(req.query.url, 0, res);
	} else res.send('false');
});

function loadURL(link, count, res) {
	if(count < 5) {
		var parse = url.parse(link);

		var conn = https;

		if(!parse.protocol || parse.protocol.indexOf('https') < 0) {
			conn = http;
		}

		conn.get(link, function(resp) {
			var headers = resp.headers;

			if(resp.statusCode < 300) {
				var content = '';
				
				resp.on('data', function(d) {
					content += d;
				});

				resp.on('end', function() {
					var domain = parse.protocol + '//' + parse.host + '/';
			
					var reg1 = new RegExp('src="', 'g');
					content = content.replace(reg1, 'src="' + domain);

					var reg2 = new RegExp('href="', 'g');
					content = content.replace(reg2, 'href="' + domain);
				
					var reg3 = new RegExp(domain + 'http', 'g');
					content = content.replace(reg3, 'http');

					var reg4 = new RegExp(domain + '//', 'g');
					content = content.replace(reg4, '//');
				
					res.send(content);
				});

			} else if(resp.statusCode < 400 && headers['location']) {
				loadURL(headers['location'], count + 1, res);
			} else {
				res.send('false');
			}
		});

		
	} else res.send('false');
}

router.get('/loadurl', function(req, res, next) {
	if(req.query.url) {
		loadURL(req.query.url, 0, res);
	} else res.send('false');
});

router.get('/loading', function(req, res, next) {
	res.render('loading');
});

module.exports = router;
