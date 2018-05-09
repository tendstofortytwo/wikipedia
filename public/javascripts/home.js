$('.article').on('mouseenter', function() {
	$('.article').addClass('unfocus');
	$(this).removeClass('unfocus').addClass('focus');
});

$('.article').on('mouseleave', function() {
	$('.article').removeClass('focus').removeClass('unfocus');
});