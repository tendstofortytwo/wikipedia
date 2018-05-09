function CollapsingLinks(el, toggle) {
	var obj = this;

	this.tag = el;
	this.close = function() {
		el.animate({
			height: 0
		}, 300);

		el.parent().addClass('closed');
	}
	this.open = function() {
		el.animate({
			height: Number(el.attr('data-maxh'))
		}, 300);

		el.parent().removeClass('closed');
	}
	this.update = function() {
		el.css('height', 'auto');

		el.attr('data-maxh', el.height());

		if(el.parent().hasClass('closed')) {
			el.css('height', '0');
		}

		else {
			el.css('height', el.attr('data-maxh') + 'px');
		}
	}

	toggle.on('click', function(e) {
		e.preventDefault();

		if(el.parent().hasClass('closed'))
			obj.open();

		else
			obj.close();
	});

	el.parent().addClass('closed');
	this.update();
}