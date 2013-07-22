define(['anima'], function(Anima) {

return function() {

	module('usage')
	
	asyncTest('direct usage', function() {
		var $element = $('<div id="element"></div>').appendTo($('#qunit-fixture'));

		// initialize the anima
		var ael = Anima.build({
			$el: $element,
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

				fadeHalf: {
					opacity: 0.5,
					zIndex: 1,

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
			}
		});

		// set a state outside of the anima
		ael.anima('state', 'fadeOut', {
			opacity: 0,
			zIndex: 0,

			__options: {
				duration: 3000,
				__after: function($el) {
					$el.css('display', 'none');
				}
			}
		});





		// flow to fadeIn
		ael.flow('fadeIn').then(function() {
			// check!
			equal(ael.$el.css('opacity'), 1, 'fadeIn opacity right');
			equal(ael.$el.css('zIndex'), 1, 'fadeIn zIndex right');

			start();
		});




	});


	asyncTest('jQuery plugin usage', function() {
		start();
	})
}
});