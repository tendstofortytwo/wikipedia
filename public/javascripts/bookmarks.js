function editBookmarks(callback) {
	var bookmarks = localStorage.getItem('bookmarks');
	if(bookmarks == null) {
		bookmarks = '';
		localStorage.setItem('bookmarks', bookmarks);
	}
	var bArray = bookmarks.split('|');

	bArray = callback(bArray) || bArray;

	localStorage.setItem('bookmarks', bArray.join('|'));
}

var bookmarks = new CollapsingLinks($('.inner-bookmarks'), $('.bookmarks-all'));

function updateBookmarks() {
	editBookmarks(function(bArray) {
		console.log(bArray);
		$('.inner-bookmarks').html('');
		for(var i = 0; i < bArray.length; i++) {
			if(bArray[i].length) {
				var el = $('<a>');
				el.attr('href', '/page/' + encodeURI(bArray[i]));
				el.html(bArray[i]);
				el.appendTo('.inner-bookmarks');
			}
		}
		bookmarks.update();
	});
}

$(window).on('load', function(e) {
	var pageTitle = $('main h1').text().trim();

	editBookmarks(function(bArray) {
		if(bArray.indexOf(pageTitle) >= 0) {
			$('a.bookmark-link span.bookmark').addClass('marked');
		}
		return bArray;
	});
});

$('a.bookmark-link').on('click', function(e) {
	var $el = $(this);
	e.preventDefault();
	var pageTitle = $('main h1').text().trim();

	if($el.find('span.bookmark').hasClass('marked')) {
		$el.find('span.bookmark').removeClass('marked');

		editBookmarks(function(bArray) {
			var i = bArray.indexOf(pageTitle);

			if(i >= 0) bArray.splice(i, 1);

			return bArray;
		});
	}

	else {
		$el.find('span.bookmark').addClass('marked');

		editBookmarks(function(bArray) {
			bArray[bArray.length] = pageTitle;

			return bArray;
		});
	}	

	updateBookmarks();
});

$(window).on('load', function() {
	updateBookmarks();
});