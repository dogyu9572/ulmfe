window.initCommonScript = function() {
    //header - scroll event
    window.addEventListener("scroll", () => {
        document.querySelector(".header")?.classList.toggle("fixed", window.scrollY > 100);
    });
    //header - menu button click event (함수 내부로 이동하여 실행 타이밍 안전 확보)
    document.querySelector(".btn_menu")?.addEventListener("click", () => {
		const header = document.querySelector(".header");
		const container = document.querySelector(".container");

		if (header) {
			header.classList.toggle("off");
			
			if (header.classList.contains("off")) {
				container?.classList.add("off");
			} else {
				container?.classList.remove("off");
			}

			const snbs = header.querySelectorAll(".snb");
			const bg = header.querySelector(".bg");
			
			if (header.classList.contains("off") && window.innerWidth >= 1024) {
				let maxH = 0;
				snbs.forEach(snb => { 
					snb.style.display = "block"; 
					snb.style.height = "auto"; 
					maxH = Math.max(maxH, snb.offsetHeight); 
				});
				snbs.forEach(snb => snb.style.height = maxH + "px");
				if (bg) bg.style.height = maxH + "px";
			} else {
				snbs.forEach(snb => { 
					snb.style.display = ""; 
					snb.style.height = ""; 
				});
				if (bg) bg.style.height = "";
			}
		}
	});
    //header - resize event
    window.addEventListener("resize", () => {
        if (window.innerWidth < 1024 || !document.querySelector(".header")?.classList.contains("on")) {
            document.querySelectorAll(".header .snb").forEach(snb => { snb.style.display = ""; snb.style.height = ""; });
            const bg = document.querySelector(".header .bg"); if (bg) bg.style.height = "";
        }
    });
    //header - mobile sub menu toggle
    document.querySelectorAll(".header .gnb .menu .mo_vw").forEach(el => {
        el.addEventListener("click", function() {
            const snb = this.nextElementSibling;
            if (snb) {
                const isHidden = window.getComputedStyle(snb).display === "none";
                snb.style.transition = "all 0.2s";
                snb.style.display = isHidden ? "block" : "none";
                const parent = this.parentElement;
                parent?.classList.toggle("open");
                Array.from(parent?.parentElement?.children || []).forEach(sib => {
                    if (sib !== parent) {
                        sib.classList.remove("open", "on");
                        const sibSnb = sib.querySelector(".snb");
                        if (sibSnb) sibSnb.style.display = "none";
                    }
                });
            }
        });
    });
    //header - desktop hover event
    document.querySelectorAll(".header .gnb .menu").forEach(el => {
        el.addEventListener("mouseenter", function() {
            if (!document.querySelector(".header")?.classList.contains("on")) this.classList.add("hover");
        });
        el.addEventListener("mouseleave", function() {
            this.classList.remove("hover");
        });
    });
	//gotop
	document.querySelector('.gotop').addEventListener('click',function(e){e.preventDefault();scrollToTop(500);});
	function scrollToTop(duration){const start=window.pageYOffset||document.documentElement.scrollTop;const startTime='now'in window.performance?performance.now():new Date().getTime();function scroll(){const now='now'in window.performance?performance.now():new Date().getTime();const time=Math.min(1,(now-startTime)/duration);const timeFunction=time<0.5?2*time*time:-1+(4-2*time)*time;window.scroll(0,Math.ceil(start-(timeFunction*start)));if(window.pageYOffset===0||document.documentElement.scrollTop===0){return;}requestAnimationFrame(scroll);}requestAnimationFrame(scroll);}
    //아이들설정
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua)) document.body.classList.add('ios_safe');
    //swiper slide
    if (document.querySelector(".fbanner") && window.Swiper) {
        new Swiper(".fbanner", {
            wrapperClass: "swiper-wrapper",
            slideClass: "swiper_slide",
            slidesPerView: "auto",
            loop: true,
            autoplay: { delay: 3000, disableOnInteraction: false },
            navigation: { nextEl: ".fbanner .swiper-button-next", prevEl: ".fbanner .swiper-button-prev" }
        });
    }
};