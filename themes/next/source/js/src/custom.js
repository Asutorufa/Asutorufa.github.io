$("#main").lazyload({
    effect: "fadeIn"
});
$("document").ready(
    function() {
        $("head").append(`<style>.main::before {background-image: url('/images/background.webp');}</style>`);
    })