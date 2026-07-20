window.initCommonScript = function() {
//header
    //header - scroll event
    window.addEventListener("scroll", () => {
        document.querySelector(".header")?.classList.toggle("fixed", window.scrollY > 100);
    });
    //header - menu button click event (함수 내부로 이동하여 실행 타이밍 안전 확보)
    document.querySelector(".btn_menu")?.addEventListener("click", () => {
        document.documentElement.classList.toggle("over_h");
        document.body.classList.toggle("over_h");
        const header = document.querySelector(".header");
        if (header) {
            header.classList.toggle("on");
        }
    });
	
    //header - mobile sub menu toggle
    document.querySelectorAll(".header .sitemap .menu > a").forEach(el => {
		el.addEventListener("click", function(e) {
			if (window.innerWidth <= 1023) {
				e.preventDefault();

				const parent = this.parentElement;
				if (!parent) return;

				const snb = this.nextElementSibling;
				
				if (parent.classList.contains("open")) {
					parent.classList.remove("open");
					if (snb) snb.style.display = "none";
				} else {
					parent.classList.add("open");
					if (snb) {
						snb.style.transition = "all 0.2s";
						snb.style.display = "block";
					}
				}

				Array.from(parent.parentElement?.children || []).forEach(sib => {
					if (sib !== parent) {
						sib.classList.remove("open", "on");
						const sibSnb = sib.querySelector(".snb");
						if (sibSnb) sibSnb.style.display = "none";
					}
				});
			}
		});
	});
	
	document.querySelector(".btn_exit")?.addEventListener("click", () => {
		document.documentElement.classList.remove("over_h");
		document.body.classList.remove("over_h");
		const header = document.querySelector(".header");
		if (header) {
			header.classList.remove("on");
		}
	});

	//header hover
	document.querySelectorAll(".header .sitemap .menu").forEach(el => {
		el.addEventListener("mouseenter", function() {
			if (!document.querySelector(".header")?.classList.contains("on")) this.classList.add("hover");
		});
		el.addEventListener("mouseleave", function() {
			this.classList.remove("hover");
		});
	});
	
	const headerEl = document.querySelector('.header');
	const btnSearch = document.querySelector('.header .btn_search');
	const closeElements = document.querySelectorAll('.total_search_area .btn_close, .total_search_area .dm');

	//select
	if (btnSearch && headerEl) {
		btnSearch.addEventListener('click', function(e) {
			e.preventDefault();
			const searchArea = document.querySelector('.total_search_area');
			headerEl.classList.toggle('search_open');

			if (headerEl.classList.contains('search_open')) {
				const searchInput = document.querySelector('.total_search_area .search_input_area .text');
				if (searchArea && searchInput) {
					void searchArea.offsetHeight;
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							searchInput.focus();
						});
					});
				}
			}
		});
	}
	closeElements.forEach(el => {
		el.addEventListener('click', function(e) {
			e.preventDefault();
			headerEl?.classList.remove('search_open');
			btnSearch?.focus();
		});
	});

	// gnb menu hover event
	const gnbItems = document.querySelectorAll('.header .gnb .list > li');
	if (headerEl && gnbItems.length > 0) {
		gnbItems.forEach(item => {
			item.addEventListener('mouseenter', () => {
				headerEl.classList.add('hover');
			});
			item.addEventListener('mouseleave', () => {
				headerEl.classList.remove('hover');
			});
		});
	}
	
	//gnb focus event
	if (headerEl && gnbItems.length > 0) {
		gnbItems.forEach(item => {
			item.addEventListener('focusin', () => {
				headerEl.classList.add('focus_open');
				item.classList.add('focus_open');
			});
			item.addEventListener('focusout', (e) => {
				if (!item.contains(e.relatedTarget)) {
					headerEl.classList.remove('focus_open');
					item.classList.remove('focus_open');
				}
			});
		});
	}
	
//footer
	//gotop
	document.querySelector('.gotop').addEventListener('click',function(e){e.preventDefault();scrollToTop(500);});
	function scrollToTop(duration){const start=window.pageYOffset||document.documentElement.scrollTop;const startTime='now'in window.performance?performance.now():new Date().getTime();function scroll(){const now='now'in window.performance?performance.now():new Date().getTime();const time=Math.min(1,(now-startTime)/duration);const timeFunction=time<0.5?2*time*time:-1+(4-2*time)*time;window.scroll(0,Math.ceil(start-(timeFunction*start)));if(window.pageYOffset===0||document.documentElement.scrollTop===0){return;}requestAnimationFrame(scroll);}requestAnimationFrame(scroll);}
	//unfixed
	const footer = document.querySelector('.footer');
	const quickArea = document.querySelector('.quick_area');
	const goTop = document.querySelector('.gotop');

	if (footer) {
		let quickAreaBottom = 0;
		let goTopHalfHeight = 0;

		const initOffsets = () => {
			if (quickArea) {
				quickAreaBottom = parseFloat(window.getComputedStyle(quickArea).bottom) || 0;
			}
			if (goTop) {
				goTopHalfHeight = goTop.offsetHeight / 2;
			}
		};

		initOffsets();
		window.addEventListener('resize', initOffsets);

		window.addEventListener('scroll', () => {
			const footerTop = footer.getBoundingClientRect().top;
			const windowHeight = window.innerHeight;
			const triggerPoint = windowHeight - (quickAreaBottom + goTopHalfHeight);

			if (footerTop <= triggerPoint) {
				footer.classList.add('unfixed');
			} else {
				footer.classList.remove('unfixed');
			}
		});
	}
	//패밀리사이트
	const familySiteBtn = document.querySelector('.family_site .btn');
	if (familySiteBtn) {
		familySiteBtn.addEventListener('click', function() {
			this.closest('.family_site').classList.toggle('on');
		});
	}
	
//아이들설정
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua)) document.body.classList.add('ios_safe');

//mobile
	document.querySelector('.aside_wrap .aside .btn').addEventListener('click', function() {
		if (window.innerWidth <= 767) {
			const aside = document.querySelector('.aside_wrap .aside');
			const snb = aside.querySelector('.snb');

			aside.classList.toggle('on');

			if (aside.classList.contains('on')) {
				snb.style.height = (snb.scrollHeight + 26) + 'px'; 
			} else {
				snb.style.height = '0px';
			}
		}
	});
};