function syncProgressBars() {
	const lineAreas = document.querySelectorAll('.line_area');
	lineAreas.forEach(function (lineArea) {
		const textPct = lineArea.querySelector('.pct');
		const bar = lineArea.querySelector('.bar');
		if (!textPct || !bar) return;
		const percent = parseInt(textPct.querySelector('strong').textContent.trim(), 10);
		let barPct = bar.querySelector('.pct');
		if (!barPct) {
			barPct = document.createElement('div');
			barPct.className = 'pct';
			barPct.setAttribute('aria-hidden', 'true');
			bar.appendChild(barPct);
		}
		bar.style.width = percent + '%';
		barPct.innerHTML = '<strong>' + percent + '</strong>%';

		const lineAreaWidth = lineArea.getBoundingClientRect().width;
		barPct.style.width = (lineAreaWidth - 4) + 'px';

		lineArea.classList.remove('pct_step1', 'pct_step2', 'pct_step3');
		if (percent >= 100) {
			lineArea.classList.add('pct_step3');
		} else if (percent >= 50) {
			lineArea.classList.add('pct_step2');
		} else {
			lineArea.classList.add('pct_step1');
		}
	});
}
window.syncProgressBars = syncProgressBars;
document.addEventListener('DOMContentLoaded', syncProgressBars);
window.addEventListener('resize', syncProgressBars);

function applyStepStatus(stepIndex) {
	const stepList = document.querySelector('.student_header .step_list');
	if (!stepList) return;
	if (typeof stepIndex !== 'number' || isNaN(stepIndex)) return;

	const items = stepList.querySelectorAll('ul > li');
	let targetLi = null;

	items.forEach(function (li, idx) {
		li.classList.remove('on', 'end');
		if (idx === stepIndex) {
			li.classList.add('on');
			targetLi = li;
		} else if (idx < stepIndex) {
			li.classList.add('end');
		}
	});

	if (targetLi) {
		targetLi.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center'
		});
	}
}
window.applyStepStatus = applyStepStatus;

function setStampOn(index) {
	const stampArea = document.querySelector('.student_header .type_stamp');
	if (!stampArea) return;
	const items = stampArea.querySelectorAll('li');
	const target = items[index];
	if (target) target.classList.add('on');
}

function setSticker1On(index) {
	const stampArea = document.querySelector('.student_header .type_sticker1');
	if (!stampArea) return;
	const items = stampArea.querySelectorAll('li');
	const target = items[index];
	if (target) target.classList.add('on');
}

function setSticker2On(index) {
	const stampArea = document.querySelector('.student_header .type_sticker2');
	if (!stampArea) return;
	const items = stampArea.querySelectorAll('li');
	const target = items[index];
	if (target) target.classList.add('on');
}

function setStampOff(index) {
	const stampArea = document.querySelector('.student_header .stamp_area');
	if (!stampArea) return;
	const items = stampArea.querySelectorAll('li');
	const target = items[index];
	if (target) target.classList.remove('on');
}

function setSticker1Off(index) {
	const stampArea = document.querySelector('.student_header .type_sticker1');
	if (!stampArea) return;
	const items = stampArea.querySelectorAll('li');
	const target = items[index];
	if (target) target.classList.remove('on');
}

function setSticker2Off(index) {
	const stampArea = document.querySelector('.student_header .type_sticker2');
	if (!stampArea) return;
	const items = stampArea.querySelectorAll('li');
	const target = items[index];
	if (target) target.classList.remove('on');
}

window.setStampOn = setStampOn;
window.setSticker1On = setSticker1On;
window.setSticker2On = setSticker2On;
window.setStampOff = setStampOff;
window.setSticker1Off = setSticker1Off;
window.setSticker2Off = setSticker2Off;

//팝업
	document.addEventListener('DOMContentLoaded', function() {
		let lastFocusedElement;
		function showLayer(targetId) {
			if (!/^[a-zA-Z0-9_-]+$/.test(targetId)) return;
			const popup = document.getElementById(targetId);
			if (!popup) return;
			lastFocusedElement = document.activeElement;
			popup.classList.add('is-active');
			const closeBtn = popup.querySelector('.btn_close');
			if (closeBtn) {
				setTimeout(() => closeBtn.focus(), 300);
			}
		}
		function hideLayer(popup) {
			if (!popup) return;
			popup.classList.remove('is-active');
			if (lastFocusedElement) {
				setTimeout(() => lastFocusedElement.focus(), 300);
			}
		}
		document.addEventListener('click', function(e) {
			const openBtn = e.target.closest('.btn_open');
			if (openBtn) {
				const targetId = openBtn.getAttribute('data-target');
				showLayer(targetId);
			}
		});
		document.addEventListener('click', function(e) {
			if (e.target.matches('.dm') || e.target.closest('.btn_close') || e.target.closest('.btn_clo')) {
				const popup = e.target.closest('.popup');
				hideLayer(popup);
			}
		});
		document.addEventListener('click', function(e) {
			const saveBtn = e.target.closest('.btns_btm .btn_end');
			if (saveBtn) {
				const popup = saveBtn.closest('.popup');
				if (!popup) return;
				const popupId = popup.id;
				const originBtn = document.querySelector(`.btn_open[data-target="${popupId}"]`);
				if (originBtn) {
					originBtn.classList.add('end');
					const stateSpan = originBtn.querySelector('.state');
					if (stateSpan) {
						stateSpan.textContent = '완료';
					}
				}
				hideLayer(popup);
			}
		});
		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				const activePopup = document.querySelector('.popup.is-active');
				if (activePopup) {
					hideLayer(activePopup);
				}
			}
		});
		document.addEventListener('keydown', function(e) {
			const activePopup = document.querySelector('.popup.is-active');
			if (!activePopup) return;

			const scrollContainer = activePopup.querySelector('.scroll');
			if (!scrollContainer) return;

			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
				const scrollAmount = 40; 
				
				scrollContainer.scrollBy({
					top: e.key === 'ArrowUp' ? -scrollAmount : scrollAmount,
					behavior: 'smooth'
				});
			}
		});
	});
