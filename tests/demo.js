define(['anima', 'jquery'], function(Anima, $) {


	$('#first').anima({
		states: {
			fadeIn: {
				opacity: 1,
				
				__options: {
					duration: 3000,
					__before: {
						display: 'block',
						zIndex: 1,
					}
				}
			},

			fadeHalf: {
				opacity: 0.5,

				__options: {
					duration: 1000,

					__before: {
						display: 'block',
						zIndex: 1,
					}
				}
			},

			halt: function() {
				var defer = $.Deferred();

				$('#first').html('halted');

				setTimeout(function() {
					$('#first').html('halt end!');
					defer.resolve();
				}, 5000)

				return defer;
			}
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




	$('#first').anima('flow',['fadeIn','halt','fadeOut','fadeHalf']).then(function() {
		$('#first').anima('flow','fadeIn');
	})
});