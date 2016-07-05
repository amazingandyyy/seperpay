'use strict'

$(document).ready(init);

function init() {
    sticky()
    windowScrollDown()
}

function sticky() {
    $(".sticky").sticky({
        topSpacing: 60
    })
}

function windowScrollDown() {
    var lastScrollTop = 0
    var st
    $(window).scroll(function() {
        console.log($(window).scrollTop());
        st = $(this).scrollTop();
        if (st < lastScrollTop) {
            $('.home-page nav').removeClass('folded')
            $('.home-page nav').css('border-bottom', '0px solid');
        } else {
            $('.home-page nav').addClass('folded')
        }
        lastScrollTop = st

        if ($(window).scrollTop() < 1) {
            $('.home-page nav').addClass('top')
        }
        if ($(window).scrollTop() > 1) {
            $('.home-page nav').removeClass('top')
        }
        if ($(window).scrollTop() > 30) {

        }
        if ($(window).scrollTop() < 540) {
            $('.home-page nav').css('box-shadow', 'inset 0 -1px 0px 0px rgba(0,0,0,0)');
        }
        if ($(window).scrollTop() > 540) {
            $('.home-page nav').css('box-shadow', 'inset 0 -1px 0px 0px rgba(0,0,0,0.1)');
        }

    })
}
