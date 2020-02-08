console.log("test");
$("document").ready(
    function() {
        console.log("ready")
        $("head").append(`<style>.main::before {background-image: url('/images/background.webp');}</style>`);
    })