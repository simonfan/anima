define(['anima', 'jquery'], function(Anima, $) {

/*	window.a = Anima.build({
		$el: $('#first'),
		initial: 'fadeIn',

		Animas: {
			fadeIn: {
				opacity: 1,
				zIndex: 1,
			},
			fadeOut: {
				opacity: 0,
				zIndex: 0
			}
		},

		animaOptions: {
			fadeIn: {
				duration: 1000,
				__before: {
					display: 'block',
					zIndex: 1,
				}
			},
			fadeOut: {
				duration: 3000,
				__after: function($el) {
					$el.css('display', 'none');
				}
			}
		}
	});


	a.on('fadeOut', function() {
		console.log('stopped at fadeOut');
	});

	a.on('enter:fadeIn', function() {
		console.log('entering fadeIn')
	});
*/



	$('#first').anima({
		initial: 'fadeIn',

		states: {
			fadeIn: {
				opacity: 1,
				zIndex: 1,
				
				__options: {
					duration: 3000,
					__before: {
						display: 'block',
						zIndex: 1,
					}
				}
			},
		},
	});

	// define a state using the plugin method
	$('#first').anima('state', 'fadeOut', {
		opacity: 0,
		zIndex: 0,

		__options: {
			duration: 3000,
			__after: function($el) {
				$el.css('display', 'none');
			}
		}
	});
});