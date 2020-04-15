// $(window).resize(function() {
//     if ($('.site-nav-toggle').css('display') !== 'none') {
//         $("#background-img").remove();
//     } else {
//         $("#background-img").remove();
//         $("head").append(`<style id='background-img'>.main::before {background-image: url('/images/background.webp');}</style>`);
//     }
// })
$("#main").lazyload({
    effect: "fadeIn"
});
// $("document").ready(
//     function() {
//         if ($('.site-nav-toggle').css('display') === 'none') {
//             $("#background-img").remove();
//             $("head").append(`<style id='background-img'>.main::before {background-image: url('/images/background.webp');}</style>`);
//         }
//     })
