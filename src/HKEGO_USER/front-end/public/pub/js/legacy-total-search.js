(function () {
	function initialize() {
		var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs_total_search li'))
		var boxes = Array.prototype.slice.call(document.querySelectorAll('.total_search_contents .box'))
		if (!tabs.length || !boxes.length) return

		tabs.forEach(function (tab, index) {
			var button = tab.querySelector('button')
			if (!button || button.dataset.tabReady) return
			button.dataset.tabReady = 'true'
			button.setAttribute('aria-selected', index === 0 ? 'true' : 'false')
			button.addEventListener('click', function () {
				tabs.forEach(function (item) {
					item.classList.remove('on')
					var itemButton = item.querySelector('button')
					if (itemButton) itemButton.setAttribute('aria-selected', 'false')
				})
				tab.classList.add('on')
				button.setAttribute('aria-selected', 'true')
				boxes.forEach(function (box, boxIndex) {
					box.style.display = index === 0 || boxIndex === index - 1 ? 'block' : 'none'
				})
			})
		})
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
	else initialize()
})()
