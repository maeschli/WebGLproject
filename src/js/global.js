/**
 * Created by Masha on 02.11.2015.
 */
$(document).ready(function() {
    $('.toggle-nav').click(function(e) {
        $(this).toggleClass('active');
        $('nav ul').toggleClass('active');

        e.preventDefault();
    });
});