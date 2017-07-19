---
---
/*
	Read Only by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
(function($) {

	skel.init({
		reset: 'full',
		breakpoints: {
			xlarge: { media: '(max-width: 1680px)', href: '{{ site.baseurl }}/css/style-xlarge.css' },
			large: { media: '(max-width: 1280px)', href: '{{ site.baseurl }}/css/style-large.css', containers: '42em', grid: { gutters: ['1.5em', 0] }, viewport: { scalable: false } },
			medium: { media: '(max-width: 1024px)', href: '{{ site.baseurl }}/css/style-medium.css', containers: '85%!' },
			small: { media: '(max-width: 736px)', href: '{{ site.baseurl }}/css/style-small.css', containers: '90%!', grid: { gutters: ['1.25em', 0] } },
			xsmall: { media: '(max-width: 480px)', href: '{{ site.baseurl }}/css/style-xsmall.css' }
		},
		plugins: {
			layers: {
				config: {
					mode: 'transform'
				},
				titleBar: {
					breakpoints: 'medium',
					width: '100%',
					height: 44,
					position: 'top-left',
					side: 'top',
					html: '<span class="toggle" data-action="toggleLayer" data-args="sidePanel"></span><span class="title" data-action="copyText" data-args="logo"></span>'
				},
				sidePanel: {
					breakpoints: 'medium',
					hidden: true,
					width: { small: 275, medium: '20em' },
					height: '100%',
					animation: 'pushX',
					position: 'top-right',
					side: 'right',
					orientation: 'vertical',
					clickToHide: true,
					html: '<div data-action="moveElement" data-args="header"></div>'
				}
			}
		}
	});

	$(function() {

		var $body = $('body'),
			$header = $('#header'),
			$nav = $('#nav'), $nav_a = $nav.find('a'),
			$wrapper = $('#wrapper');

		// Use hash in index.html
		if (window.location.pathname === '/') {

			// Header.
			var ids = [];

			// Set up nav items.
			$nav_a
				.scrolly({ offset: 44 })
				.on('click', function(event) {

					var $this = $(this),
						href = $this.attr('href');

					// Not an internal link? Bail.
					if (href.charAt(0) != '#') {
						return;
					}

					// Prevent default behavior.
					event.preventDefault();

					// Remove active class from all links and mark them as locked (so scrollzer leaves them alone).
					$nav_a
						.removeClass('active')
						.addClass('scrollzer-locked');

					// Set active class on this link.
					$this.addClass('active');

				})
				.each(function() {

					var $this = $(this),
						href = $this.attr('href'),
						id;

					// Not an internal link? Bail.
					if (href.charAt(0) != '#')
						return;

					// Add to scrollzer ID list.
					id = href.substring(1);
					$this.attr('id', id + '-link');
					ids.push(id);

				});

			// Initialize scrollzer.
			if (ids.length) {
				$.scrollzer(ids, { pad: 300, lastHack: true });
			}
		}
		else {
			$nav_a
				.on('click', function(event) {
					var $this = $(this);
					window.location.href = '/' + $this.attr('href');
				});
		}
	});

})(jQuery);