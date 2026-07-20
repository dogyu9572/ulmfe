(function () {
	function initialize() {
		var header = document.querySelector('.header')
		if (!header || header.dataset.nativeHeaderReady) return
		var searchButton = header.querySelector('.btn_search')
		var searchArea = header.querySelector('.total_search_area')
		var searchInput = searchArea && searchArea.querySelector('.search_input_area .text')
		var searchForm = searchArea && searchArea.querySelector('.search_input_area')
		var closeButtons = searchArea && searchArea.querySelectorAll('.dm, .btn_close')
		if (!searchButton || !searchArea || !searchForm) return
		header.dataset.nativeHeaderReady = 'true'

		function applySearchState(open) {
			header.dataset.nativeSearchOpen = open ? 'true' : 'false'
			header.classList.toggle('search_open', open)
			searchButton.setAttribute('aria-expanded', open ? 'true' : 'false')
			searchArea.setAttribute('aria-hidden', open ? 'false' : 'true')
			if (open && searchInput) window.setTimeout(function () { searchInput.focus() }, 0)
		}

		searchButton.addEventListener('click', function (event) {
			event.preventDefault()
			event.stopPropagation()
			event.stopImmediatePropagation()
			applySearchState(header.dataset.nativeSearchOpen !== 'true')
		}, true)

		if (closeButtons) {
			closeButtons.forEach(function (button) {
				button.addEventListener('click', function (event) {
					event.preventDefault()
					event.stopPropagation()
					event.stopImmediatePropagation()
					applySearchState(false)
					searchButton.focus()
				}, true)
			})
		}

		searchForm.addEventListener('submit', function (event) {
			event.preventDefault()
			event.stopPropagation()
			event.stopImmediatePropagation()
			var keyword = searchInput ? searchInput.value.trim() : ''
			window.location.href = keyword ? '/total_search/index?search_keyword=' + encodeURIComponent(keyword) : '/total_search/index'
		}, true)

		window.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && header.dataset.nativeSearchOpen === 'true') {
				applySearchState(false)
				searchButton.focus()
			}
		})

		new MutationObserver(function () {
			if (header.dataset.nativeSearchOpen === 'true' && !header.classList.contains('search_open')) {
				header.classList.add('search_open')
			}
		}).observe(header, { attributes: true, attributeFilter: ['class'] })
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
	else initialize()
})()
