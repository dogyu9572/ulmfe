document.querySelectorAll('.popup .imgfit').forEach(el => {
    new Swiper(el, {
        sliceVar: undefined,
        loop: true,
        pagination: {
            el: el.querySelector('.pagination'),
            clickable: true,
        },
    });
});