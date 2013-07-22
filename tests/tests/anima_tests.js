define(['anima'], function(Anima) {

return function() {

	module('usage')
	
	asyncTest('direct usage', function() {
		var $element = $('<div id="element"></div>')
							.appendTo($('#qunit-fixture'))
							.css({ position: 'absolute' });

		// initialize the anima
		var ael = Anima.build({
			$el: $element,
			states: {
				fadeIn: {
					opacity: 1,
					
					__options: {
						duration: 400,
						__before: {
							display: 'block',
							zIndex: 1,
						}
					}
				},

				fadeHalf: {
					opacity: 0.5,

					__options: {
						duration: 500,

						__before: {
							display: 'block',
							zIndex: 1,
						}
					}
				},

				halt: function() {
					var _this = this,
						defer = $.Deferred();

					this.$el.html('halted');

					setTimeout(function() {
						_this.$el.html('halt end!');
						defer.resolve();
					}, 200)

					return defer;
				}
			}
		});

		// set a state outside of the anima
		ael.anima('state', 'fadeOut', {
			opacity: 0,
			zIndex: 0,

			__options: {
				duration: 200,
				__after: function($el) {
					$el.css('display', 'none');
				}
			}
		});





		// flow to fadeIn
		ael.flow('fadeIn')
			.then(function() {
				// check!
				equal(ael.$el.css('opacity'), 1, 'fadeIn opacity right');
				equal(ael.$el.css('zIndex'), 1, 'fadeIn zIndex right');
				// animate ael
				return ael.flow('halt');
			})
			.then(function() {
				// check!
				equal(ael.$el.html(), 'halt end!');

				// animate ael
				return ael.flow('fadeOut')
			})
			.then(function() {
				// check!
				equal(ael.$el.css('zIndex'), 0, 'fadeOut zIndex correct');

				// animate ael
				return ael.flow(['fadeIn','fadeHalf']);
			})
			.then(function() {
				// check!
				equal(ael.$el.css('opacity'), '0.5', 'fadeHalf opacity right');
				equal(ael.$el.css('zIndex'), 1, 'fadeHalf zIndex right');

				// continue normal unit tests flow.
				start();
			});
	});


	/*
		jquery plugin usage test
	*/
	asyncTest('jQuery plugin usage', function() {
		var $element = $('<div id="element"></div>')
							.appendTo($('#qunit-fixture'))
							.css({ position: 'absolute' });

		$element.anima({
			states: {
				fadeIn: {
					opacity: 1,
					
					__options: {
						duration: 400,
						__before: {
							display: 'block',
							zIndex: 1,
						}
					}
				},

				fadeHalf: {
					opacity: 0.5,

					__options: {
						duration: 500,

						__before: {
							display: 'block',
							zIndex: 1,
						}
					}
				},

				halt: function() {
					var _this = this,
						defer = $.Deferred();

					this.$el.html('halted');

					setTimeout(function() {
						_this.$el.html('halt end!');
						defer.resolve();
					}, 200)

					return defer;
				}
			}
		});


		$element.anima('state', 'fadeOut', {
			opacity: 0,

			__options: {
				duration: 200,
				__before: {
					zIndex: 0
				},
				__after: function($el) {
					$el.css('display', 'none');
				}
			}
		});





		// flow to fadeIn
		$element.anima('flow','fadeIn')
			.then(function() {
				// check!
				equal($element.css('opacity'), 1, 'fadeIn opacity right');
				equal($element.css('zIndex'), 1, 'fadeIn zIndex right');
				// animate $element.anima
				return $element.anima('flow','halt');
			})
			.then(function() {
				// check!
				equal($element.html(), 'halt end!');

				// animate $element.anima
				return $element.anima('flow','fadeOut')
			})
			.then(function() {
				// check!
				equal($element.css('zIndex'), 0, 'fadeOut zIndex correct');

				// animate $element.anima
				return $element.anima('flow', ['fadeIn','fadeHalf']);
			})
			.then(function() {
				// check!
				equal($element.css('opacity'), '0.5', 'fadeHalf opacity right');
				equal($element.css('zIndex'), 1, 'fadeHalf zIndex right');

				// continue normal unit tests flow.
				start();
			});
	})
}
});