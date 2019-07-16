function init_horizontal_slider(slider_id){
    var swiper = new Swiper("#" + slider_id, {
        slidesPerView: 3,
        spaceBetween: 30,
        slidesPerGroup: 3,
        mode: 'horizontal',
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            480: {
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 30,
                slidesPerGroup: 2,
            }
        }
    });

    //triggers image lazy loading of newly visible images on slideChange
    swiper.on('transitionEnd', function () {
        var instance = $('.lazy').data("plugin_lazy");
        // loads all elements in current viewport threshold
        instance.update();
    });
}

init_horizontal_slider_callback();
