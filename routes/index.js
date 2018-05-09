var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/bookmarks', function(req, res, next) {
	res.render('bookmarks');
});

router.get('/wiki/:page', function(req, res, next) {
	res.redirect('/page/' + req.params.page);
});

router.post('/summary', function(req, res, next) {
	if(req.body.text) {
		/*request.post({
			url: 'https://api.deepai.org/api/summarization',
			headers: {
				'Api-Key': 'e0e7550d-5d84-4678-ba50-92cc603406d0'
			},
			formData: {
				'text': req.body.text,
			}
		}, function(err, httpResponse, body) {
			if(err) {
				console.error('request failed:', err);
				return;
			}
			var response = JSON.parse(body);
			res.send(response);
		});*/ 
		var apiKey = '7C953ADBFF';
		//                   ^------- XINO CW BFF <3

		request.post({
			url: 'http://api.smmry.com/&SM_API_KEY=' + apiKey,
			headers: {
				'Expect': ''
			},
			formData: {
				'sm_api_input': req.body.text
			}
		}, function(err, httpResponse, body) {
			if(err) {
				console.error('request failed:', err);
				res.send('fail');
				return;
			}
			var response = JSON.parse(body);
			console.log(response)
			res.send(response);
		})

	} else {
		res.send('fail');
	}
});

router.get('/search', function(req, res, next) {
	if(req.query.term) {
		var url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&utf-8&srsearch=' + encodeURI(req.query.term);
		request(url, function(e, resp, body) {
			if(!e && resp.statusCode < 400) {
				body = JSON.parse(body);

				res.render('search', {
					results: body.query.search,
					term: req.query.term
				});
			}
		});
	}
	else {
		res.redirect('https://xino.co.in');
	}
});

router.get('/page/:page', function(req, res, next) {
	if(req.params.page == 'Elon Musk') 
		res.render('musk');

	else if(req.params.page == 'Douglas Adams')
		res.render('adams');

	else if(req.params.page == 'Kevin Mitnick')
		res.render('kevin');

	else {
		//// plaintext url
		//var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&redirects=1&titles=' + encodeURI(req.params.page);
		// links+styles url
		var url = 'https://en.wikipedia.org/w/api.php?action=parse&contentmodel=text&format=json&redirects=1&page=' + encodeURI(req.params.page);
		request(url, function(e, resp, body) {
			if(!e && resp.statusCode < 400) {
				body = JSON.parse(body);
				/*var page;
				for(var key in body.query.pages) {
					page = body.query.pages[key];
					break;
				}*/
				var content = body.parse.text['*'];
				res.render('page', {
					text: content,
					title: body.parse.title,
					removeRightBar: true
				});
			}

			else {
				res.send('lmao fail');
				console.log(resp);
			}
		});
	}
});

module.exports = router;
