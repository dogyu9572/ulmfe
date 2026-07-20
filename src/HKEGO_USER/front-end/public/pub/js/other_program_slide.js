document.addEventListener('DOMContentLoaded', function () {
    const programSwiper = new Swiper('.program_slide', {
        slidesPerView: 1,
        spaceBetween: 10,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        breakpoints: {
            768: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
            1280: {
                slidesPerView: 4,
                spaceBetween: 40,
            },
        },
        pagination: {
            el: '.program_btm .paging',
            type: 'custom',
            renderCustom: function (swiper, current, total) {
                const currentString = String(current).padStart(2, '0');
                const totalString = String(total).padStart(2, '0');
                return `<strong>${currentString}</strong>/<span>${totalString}</span>`;
            }
        },
        navigation: {
            nextEl: '.program_btm .next',
            prevEl: '.program_btm .prev',
        },
        on: {
            init: function () {
                togglePaging(this);
            },
            breakpoint: function () {
                togglePaging(this);
            }
        }
    });
    function togglePaging(swiper) {
        const pagingEl = document.querySelector('.program_btm .paging');
        if (!pagingEl) return;
        const realSlidesCount = swiper.slides.filter(function (slideEl) {
            return !slideEl.classList.contains('swiper-slide-duplicate');
        }).length;
        const currentParamsView = swiper.params.slidesPerView;
        if (realSlidesCount <= currentParamsView) {
            pagingEl.style.display = 'none';
        } else {
            pagingEl.style.display = '';
        }
    }
});