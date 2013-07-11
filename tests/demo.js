define(['animastate'], function(Animastate) {

	window.a = Animastate.build({
		$el: $('#first'),
		initial: 'stopped:fadeOut',

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
				duration: 5000,
				__before: function($el) {
					$el.css('display', 'block');
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


	window.b = Animastate.build({});


	a.on('lalala', function() {
		alert('a: lalala');
	});

	b.on('lalala', function() {
		alert('b: lalala');
	})

});