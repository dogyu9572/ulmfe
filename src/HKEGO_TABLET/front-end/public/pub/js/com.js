window.initCommonScript = function() {
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
    //아이들설정
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua)) document.body.classList.add('ios_safe');
};