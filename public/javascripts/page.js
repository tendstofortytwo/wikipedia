var page = location.pathname.split('/')[2].split('%20').join('-');

var contents = new CollapsingLinks($('nav.inner-contents'), $('.contents-link'));

$('body').on('click', 'nav.inner-links a', function(e) {
	var href = $(this).attr('href');

	if(href[0] == '#') {
		e.preventDefault();

		$('html, body').animate({
			scrollTop: $(href).offset().top - $('header').height() - 10
		}, 500);
	}
});

// <highlighting>

// shifted to highlights.js

// </highlighting>
// <summary>

$('.summary-link').on('click', function(e) {
	e.preventDefault();

	$('.loader').css('opacity', '1');

	$.post('/summary', {
		text: $('main').text()
	}, function(data) {
		var output = $('<div>');
		output.addClass('summary-output');
		output.html('<p>' + data['sm_api_content'].replace(/\n/g, '</p><p>') + '</p>');

		$('.loader').css('opacity', '0');
		output.insertBefore($('main h1'));
		var maxh = output.height();
		output.addClass('hidden');

		setTimeout(function() {
			output.animate({
				height: maxh+16
			}, 250);
		}, 100);
	});
});

// </summary>
// <multiwindow>

var doubleClick = false;

$('main a').on('click', function(e) {
	var $el = $(this);

	if(!doubleClick && $el.attr('data-opened') != '1' && $el.attr('href')[0] != '#') {
		doubleClick = true;
		setTimeout(function() {
			doubleClick = false;
		}, 150);

		e.preventDefault();

		var url = $el.attr('href');

		$('[data-opened="1"]').attr('data-opened', '0');

		$el.attr('data-opened', '1');

		openLinkInFrame(url, $el.find('h1').text().trim());
	}
});

function openLinkInFrame(url, title) {
	if(url.indexOf('youtube.com/watch?v=') >= 0) {
		url = url.replace('watch?v=', 'embed/');
	}

	else if(url.indexOf('/') == 0) {
		window.open(url, '_blank');
		$('[data-opened="1"]').attr('data-opened', '0');
		return;
	}

	$('.action-heading h3').html('Reference: ' + title);
	$('.actions-bar').attr('class', 'actions-bar webpage');
	$('iframe').attr('src', '/handler/loading');

	$.ajax({
		url: '/handler/urlcheck/?url=' + encodeURIComponent(url),
		success: function(data) {
			if(data == 'false') {
				/*window.open(url, '_blank');
				$el.attr('data-opened', '0');*/
				$('iframe').attr('src', '/handler/loadurl?url=' + encodeURIComponent(url)).parent().addClass('visible');
				$('iframe').addClass('touchmenot').attr('data-link', url);
				$('.iframe-title').html(title);
				$('iframe').on('load', function() {
					var k = $(this);
					k.contents().find('body').on('click', function(e) {
						e.preventDefault();
						k.parent().removeClass('visible');
						window.open(url, '_blank');
						$('[data-opened="1"]').attr('data-opened', '0');
						k.contents().find('body').off('click');
					});
				});
			}
			else {
				$('iframe').removeClass('touchmenot').removeAttr('data-link');
				$('iframe').attr('src', url).parent().addClass('visible');
				$('.iframe-title').html(title);
			}
		}
	})
}

// </multiwindow>
// <bookmarks>

// shifted to bookmarks.js

// </bookmarks>
// <wikipagehax>

if($('.mw-parser-output').length) {
	if($('#toc').length) {
		var toc = $('#toc');

		var links = toc.find('.toclevel-1 > a');

		links.each(function() {
			var og = $(this);

			var newLink = $('<a>');

			newLink.attr('href', og.attr('href'));
			newLink.html(og.find('.toctext').text());

			newLink.appendTo('nav.inner-contents');
		});

		contents.update();
		toc.remove();
	}
}

// </wikipagehax>