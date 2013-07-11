define(['anima', 'jquery'], function(Animastate, $) {

/*	window.a = Animastate.build({
		$el: $('#first'),
		initial: 'fadeIn',

		animaStates: {
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

		animaStates: {
			fadeIn: {
				opacity: 1,
				zIndex: 1,
			},
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

	// define a state using the plugin method
	$('#first').anima('state', 'fadeOut', { opacity: 0, zIndex: 0 });
});