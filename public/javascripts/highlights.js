var page = page || '';

rangy.init();
var highlighter = rangy.createHighlighter();

var applier = rangy.createClassApplier('highlight');
highlighter.addClassApplier(applier);

$(window).on('load', function() {
	var stored = localStorage.getItem('highlighted-' + page ),
		names = localStorage.getItem('highlight-text-' + page);

	if(stored) {
		highlighter.deserialize(stored);
	}

	if(!names) {
		localStorage.setItem('highlight-text-' + page, JSON.stringify({
			values: []
		}));

		var savedHighlights = localStorage.getItem('saved-highlights');

		if(!savedHighlights) savedHighlights = '';

		savedHighlights = savedHighlights.split('|');

		savedHighlights[savedHighlights.length] = page;

		localStorage.setItem('saved-highlights', savedHighlights.join('|'));
	}

	updateHighlighted();

	console.log(location.hash);

	if(location.hash == '#openLink' && localStorage.getItem('open-link')) {
		var link = localStorage.getItem('open-link');

		console.log(link);

		var highlightsHere = $('body').find('.highlight');

		highlightsHere.each(function() {
			if($(this).text() == link) {
				var el = $(this);
				$('html, body').animate({
					scrollTop: el.offset().top - $('header').height() - 10
				}, 500, function() {
					el.removeClass('flash');
					setTimeout(function() {
						el.addClass('flash');
						localStorage.setItem('open-link', null);
					}, 100);
				});
			}

			else {
				console.log($(this).text());
				console.log(link);
			}
		});
	}
});

function highlightEdit(fn, editPage) {
	editPage = editPage || page;

	var highlights = JSON.parse(localStorage.getItem('highlight-text-' + editPage));

	fn(highlights, editPage);

	localStorage.setItem('highlight-text-' + editPage, JSON.stringify(highlights));
}

function highlightSelected(selection) {

	/*highlighter.highlightSelection('highlight');*/

	var selection = selection || rangy.getSelection();

	highlighter.highlightSelection('highlight', {
		selection: selection
	});

	console.log(selection.toString());

	localStorage.setItem('highlighted-' + page , highlighter.serialize(selection));

	
	highlightEdit(function(highlights) {
		highlights.values[highlights.values.length] = selection.toString();	
		console.log(highlights.values);
		updateHighlighted();
	});

}

function unhighlight($el) {
	var el = $el[0];
	var text = $(el).text().toLowerCase().replace(/\s/g, '');

	highlightEdit(function(highlights) {
		for(var i = 0; i < highlights.values.length; i++) {
			if(highlights.values[i].toLowerCase().replace(/\s/g, '') == text) {
				highlights.values.splice(i, 1);
				break;
			}
		}
	});

	window.getSelection().selectAllChildren(el);
    highlighter.unhighlightSelection();
    window.getSelection().removeAllRanges();
    localStorage.setItem('highlighted-' + page , highlighter.serialize());

    updateHighlighted();
}

function eachHighlight(callback) {
	var allHighlights = localStorage.getItem('saved-highlights').split('|');

	for(var i = 0; i < allHighlights.length; i++) {
		if(allHighlights[i].length)
			highlightEdit(callback, allHighlights[i]);
	}
}

function updateHighlighted() {
	setTimeout(function() {
		$('.notes').html('');
		eachHighlight(function(highlights, pageTitle) {
			console.log(pageTitle, highlights);
			for(var i = 0; i < highlights.values.length; i++) {
				var hl = highlights.values[i];

				var note = $('<a>');

				var dt = Date.now();

				note.attr('href', '#note-' + i + dt)

				note.addClass('note');

				note.attr('data-pagename', pageTitle.split('-').join(' '));

				note.html('<p><span class="hl">' + hl + '</span> <span class="link">View in page</span></p>');

				var el, found = false;

				$('body').find('.highlight').each(function() {
					if($(this).text() == hl && !found) {
						el = $(this);
						found = true;
					}
				});


				if(el) {
					var close = $('<span>');
					close.addClass('remove-note');
					el.attr('id', 'note-' + i + dt);
					close.attr('data-kill', 'note-' + i + dt);
					//close.appendTo(note);
				}

				else {
					note.attr('href', '/page/' + pageTitle.split('-').join('%20') + '#openLink');
					note.addClass('external');
				}

				note.appendTo($('.notes'));

				note.find('p').css('height', note.find('p').height());

				note.addClass('small');
			}
		});
	}, 100);
}

var mouseX, mouseY;

$(window).on('mousedown', function(e) {
	mouseX = e.pageX;
	mouseY = e.pageY;
});

$(window).on('mouseup', function(e) {
	if(window.getSelection().toString().replace(/\s/g, '').length
		&& mouseX != e.pageX && mouseY != e.pageY) {
		createAddButton(mouseX, mouseY);
	}
});

function createAddButton(x, y) {
	selection = rangy.getSelection();

	var startTag = selection.nativeSelection.anchorNode;
	var endTag = selection.nativeSelection.focusNode;

	if(startTag !== endTag && startTag.parentNode !== endTag.parentNode) return;

	var button = $('<div>');
	button.html('Add highlight');
	button.addClass('floating-button');
	button.css({
		'top': y + 'px',
		'left': x + 'px',
	});

	button.insertAfter($('footer'));

	button.on('click', function(e) {
		highlightSelected(selection);
	});

	setTimeout(function() {
		$('html').on('click', function() {
			button.remove();
			window.getSelection().removeAllRanges();
			$('html').off('click');
		});
	});
}

$('body').on('click', '.highlight', function(e) {
	createRemoveButtonFor($(this), e.pageX, e.pageY);
});

function createRemoveButtonFor(el, x, y) {
	var button = $('<div>');
	button.html('Remove highlight');
	button.addClass('floating-button');
	button.css({
		'top': y + 'px',
		'left': x + 'px',
	});

	button.insertAfter($('footer'));

	button.on('click', function(e) {
		unhighlight(el);
	});

	setTimeout(function() {
		$('html').on('click', function() {
			button.remove();
			window.getSelection().removeAllRanges();
			$('html').off('click');
		});
	});
}

$('.notes').on('click', '.remove-note', function(e) {
	e.preventDefault();
	e.stopPropagation();

	console.log(e.target);

	var $el = $(this);

	if($el.attr('data-kill') != 'external') {
		var note = $($el.parent().attr('href'));

		console.log(note.html());

		unhighlight(note);
	}

	else {
		var page = $el.parent().attr('data-pagename').split(' ').join('-');
		var text = $el.parent().find('p').text();

		highlightEdit(function(highlights) {
			for(var i = 0; i < highlights.values.length; i++) {
				if(highlights.values[i] == text) {
					highlights.values.splice(i, 1);
					break;
				}
			}
		}, page);

		updateHighlighted();
	}
});

$('body').on('click', 'a.note:not(.external)', function(e) {
	e.preventDefault();

	var href = $(this).attr('href');

	if(e.target == $(this).find('.link')[0]) {
		$('html, body').animate({
			scrollTop: $(href).offset().top - $('header').height() - 10
		}, 500, function() {
			$(href).removeClass('flash');
			setTimeout(function() {
				$(href).addClass('flash');
			}, 100);
		});
	}

	else {
		$(this).toggleClass('small');
	}
});

$('body').on('click', 'a.note.external', function(e) {
	if(e.target == $(this).find('.link')[0]) {
		var hl = $(this).find('.hl').text();
		localStorage.setItem('open-link', hl);
	}
	else {
		e.preventDefault();
		$(this).toggleClass('small');
	}
});

$('.action-button').on('click', function() {
	if($('.actions-bar').hasClass('closed')) {
		$('.action-heading h3').html('Notes');
		$('.actions-bar').removeClass('closed');
		$('.actions-bar').addClass('notes-page');
	}

	else {
		$('.action-heading h3').html('Notes');
		$('.actions-bar').attr('class', 'actions-bar closed');
		$('[data-opened="1"]').attr('data-opened', '0');
	}
});