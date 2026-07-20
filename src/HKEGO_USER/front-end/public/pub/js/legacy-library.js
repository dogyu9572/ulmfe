(function () {
	function renderPaging(swiper, current, total) {
		return '<strong>' + String(current).padStart(2, '0') + '</strong>/<span>' + String(total).padStart(2, '0') + '</span>'
	}

	function initializeSliders(attempt) {
		var bookSlide = document.querySelector('.book_slide')
		var newBookSlide = document.querySelector('.new_book_slide')
		if (!bookSlide && !newBookSlide) return
		if (typeof window.Swiper !== 'function') {
			if (attempt < 100) window.setTimeout(function () { initializeSliders(attempt + 1) }, 50)
			return
		}
		if (bookSlide && !bookSlide.dataset.sliderReady) {
			bookSlide.dataset.sliderReady = 'true'
			new window.Swiper(bookSlide, {
				slidesPerView: 2,
				spaceBetween: 10,
				navigation: {
					nextEl: '.book_slide .arrow.next',
					prevEl: '.book_slide .arrow.prev'
				},
				pagination: {
					el: '.book_slide .paging',
					type: 'custom',
					renderCustom: renderPaging
				},
				breakpoints: {
					768: { slidesPerView: 4, spaceBetween: 16 },
					1024: { slidesPerView: 3, spaceBetween: 20 },
					1280: { slidesPerView: 4, spaceBetween: 30 }
				}
			})
		}
		if (newBookSlide && !newBookSlide.dataset.sliderReady) {
			newBookSlide.dataset.sliderReady = 'true'
			new window.Swiper(newBookSlide, {
				slidesPerView: 2,
				spaceBetween: 10,
				navigation: {
					nextEl: '.new_book_slide .arrow.next',
					prevEl: '.new_book_slide .arrow.prev'
				},
				pagination: {
					el: '.new_book_slide .paging',
					type: 'custom',
					renderCustom: renderPaging
				},
				breakpoints: {
					768: { slidesPerView: 4, spaceBetween: 20 },
					1024: { slidesPerView: 4, spaceBetween: 30 },
					1280: { slidesPerView: 4, spaceBetween: 40 }
				}
			})
		}
	}

	function initializeMonthSelect() {
		var monthSelect = document.querySelector('.month_select')
		if (!monthSelect || monthSelect.dataset.monthReady) return
		var dateDisplay = monthSelect.querySelector('strong')
		var prevButton = monthSelect.querySelector('.arrow.prev')
		var nextButton = monthSelect.querySelector('.arrow.next')
		if (!dateDisplay || !prevButton || !nextButton) return
		monthSelect.dataset.monthReady = 'true'
		var currentDate = new Date()
		function updateDisplay() {
			dateDisplay.textContent = currentDate.getFullYear() + '. ' + String(currentDate.getMonth() + 1).padStart(2, '0')
		}
		prevButton.addEventListener('click', function () {
			currentDate.setMonth(currentDate.getMonth() - 1)
			updateDisplay()
		})
		nextButton.addEventListener('click', function () {
			currentDate.setMonth(currentDate.getMonth() + 1)
			updateDisplay()
		})
		updateDisplay()
	}

	function initialize() {
		initializeSliders(0)
		initializeMonthSelect()
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
	else initialize()
})()
