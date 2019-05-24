$(function() {
	const timeline = document.querySelector(".timeline ol"),
	elH = document.querySelectorAll(".timeline li > div"),
	arrows = document.querySelectorAll(".timeline-container .arrows .arrow"),
	arrowPrev = document.querySelector(".timeline-container .arrows .arrow__prev"),
	arrowNext = document.querySelector(".timeline-container .arrows .arrow__next"),
	firstItem = document.querySelector(".timeline li:first-child"),
	lastItem = document.querySelector(".timeline li:last-child"),
	xScrolling = 280,
	disabledClass = "disabled";


	var clicking = false;
	var dragging = false;
	var previousX;
	var previousY;


	function setEqualHeights(el) {
		let counter = 0;
		for (let i = 0; i < el.length; i++) {
			const singleHeight = el[i].offsetHeight;

			if (counter < singleHeight) {
			counter = singleHeight;
			}
		}

		for (let i = 0; i < el.length; i++) {
			el[i].style.height = `${counter}px`;
		}
	}

	function isElementInViewport(el) {
	const rect = el.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
	}

	// SET STATE OF PREV/NEXT ARROWS
	function setBtnState(el, flag = true) {
		if (flag) {
		el.classList.add(disabledClass);
		} else {
		if (el.classList.contains(disabledClass)) {
			el.classList.remove(disabledClass);
		}
		el.disabled = false;
		}
	}

	$(".timeline a").on("click", function(e) {
		if (dragging) {
			e.preventDefault();
		}
	});

	$(".timeline").on("mouseup", function(e) {
		var instance = $('.lazy').data("plugin_lazy");
		// loads all elements in current viewport threshold
		instance.update();
	});

	$(".timeline").on('mousedown', function(e) {

		e.preventDefault();
		previousX = e.clientX || e.touches[0].clientX;
		previousY = e.clientY || e.touches[0].clientY;
		clicking = true;
	});

	$(".timeline").on('touchstart', function(e) {


		previousX = e.clientX || e.touches[0].clientX;
		previousY = e.clientY || e.touches[0].clientY;
		clicking = true;
	});

	$(document).on('mouseup touchend', function(e) {

		if (clicking) {
		if (dragging) {
			//e.preventDefault();
		}
		clicking = false;

			setTimeout(function() {
			dragging = false;
		}, 500);
		}
	});

	$("#timeline").on('mouseleave touchcancel', function(e) {

		if (clicking) {
		//e.preventDefault();
		clicking = false;

		setTimeout(function() {
			dragging = false;
		}, 500);
		}
	});

	$(".timeline").on('mousemove touchmove', function(e) {

		if (clicking) {
			dragging = true;
			//e.preventDefault();
			clientX = e.clientX || e.touches[0].clientX;
			clientY = e.clientY || e.touches[0].clientY;
			var directionX = (previousX - clientX) > 0 ? 1 : -1;
			var directionY = (previousY - clientY) > 0 ? 1 : -1;
			$(".timeline").scrollLeft($(".timeline").scrollLeft() + (previousX - clientX));
			$(".timeline").scrollTop($(".timeline").scrollTop() + (previousY - clientY));
			previousX = clientX;
			previousY = clientY;
		}
	});

	setEqualHeights(elH);
	arrowNext.addEventListener("click", function(e) {
		$(".timeline").animate({scrollLeft:  $(".timeline").scrollLeft() + 200}, 1500);
	});

	arrowPrev.addEventListener("click", function(e) {
		$(".timeline").animate({scrollLeft:  $(".timeline").scrollLeft() - 200}, 1500);
	});
	});
