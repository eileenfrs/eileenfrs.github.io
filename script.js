jQuery(function($) {
    var $window = $(window);
    var $scrollButton = $('#scroll');
    var $htmlBody = $('html, body');
    var $bg = $('.bg');
    var $burgerMenu = $('#burger-menu');
    var $navLinks = $('#nav-links');

	//custom cursor
    var cursor1 = document.querySelector(".cursor");
    var cursor2 = document.querySelector(".cursor2");
    var cursor3 = document.querySelector(".cursor3");
    var request;

    document.querySelector("body").addEventListener("mousemove", function(n) {
        cancelAnimationFrame(request);
        request = requestAnimationFrame(function() {
            cursor1.style.left = n.clientX + "px";
            cursor1.style.top = n.clientY + "px";
            cursor2.style.left = n.clientX + "px";
            cursor2.style.top = n.clientY + "px";
            cursor3.style.left = n.clientX + "px";
            cursor3.style.top = n.clientY + "px";
        });
    });

	//custom cursor hover effect
    function addHover() {
        cursor2.classList.add("hover");
        cursor3.classList.add("hover");
    }

    function removeHover() {
        cursor2.classList.remove("hover");
        cursor3.classList.remove("hover");
    }

    removeHover();

    var hoverTargets = document.querySelectorAll(".hover-target");
    hoverTargets.forEach(function(target) {
        target.addEventListener("mouseover", addHover);
        target.addEventListener("mouseout", removeHover);
    });

    // scroll event handler navbar bg
    $window.on('scroll', function() {
        var scrollTop = $window.scrollTop();
        
        if (scrollTop > 100) {
            $scrollButton.fadeIn();
        } else {
            $scrollButton.fadeOut();
        }

        if (scrollTop > 100) {
            $bg.addClass('show');
        } else {
            $bg.removeClass('show');
        }
    });

    // top offset for links - smooth scroll
    $('.scroll').on('click', function(e) {        
        e.preventDefault();
        $htmlBody.animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 1500);
    });

	// burger menu click
	$burgerMenu.on('click', function() {
		$navLinks.toggleClass('show');
		$(this).toggleClass('menu-clicked');
	});


    // email validation
    $('form').on('submit', function(event) {
        var email = $('#mail').val();
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            $('#mail').focus();
            event.preventDefault();
        }
    });
});
