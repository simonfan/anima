implementing transitate method for all other states.

/*
	What is this module made for?

	Anima is a coordinator of transitions for a single element.

	1: define css properties as a named state object
	2: transitate between all the defined states by only callling their names.
	3: define __before and __after actions to be performed on the objects.


	A very important functionality (which is going to be implemented on v2)
	is the capability of understanding which is the current 'objective' of the animation queue
	and base actions on that.

	Whenever an element is 'on-transition', if it is asked to 'transitate' to some other state,
	the anima object should be capable of inteligently verifying the new 'objective' against the 
	one current being performed so that animations are not re-executed.
*/

qwe qwe wqe qew 

define(['jquery','fsm','underscore','_.mixins'], function($, FSM, undef, undef) {

	// internally used methods.
	var anima = {

		// INTERNAL //
		_processAnimaSpecialOption: function(option) {
			//// PROCESS SPECIAL OPTION ////
			if (typeof option === 'function') {

				var opts = option.call(this, this.$el);

				// if the function returns an object, assume the object
				// is a css object to be set on the element
				if (typeof opts === 'object') {
					this.$el.css(opts);
				}

			} else if (typeof option === 'object') {
				// assume it is a css object to be set on the element
				this.$el.css(option);
			}
		},

		// the state object is not an exact jquery animation object.
		// the state might be just 
		_$animation: function(astate) {
			var $animation = _.clone(astate);

			delete $animation.__options;

			return $animation;
		},

		_$options: function(aoptions) {
			var $options = _.clone(aoptions);

			delete $options.__before;
			delete $options.__after;

			return $options;
		},


		queue: function(objective) {

		},

		////////
		/// for each state set on the queue. animate the element.
		/// here we use the original behaviour of jquery animate method
		/// which queues animations on the fx queue.
		dequeue: function() {
			var _this = this;
			_.each(this.queue, function(statename, index) {

					// astate is the original state object provided on state definition
				var astate = _this.anima('state', objective),
					// aoptions is the special property __options defined on the astate
					aoptions = astate.__options,

					// css object passed to jquery.animate(css, options)
					$animation = _this.anima('_$animation', astate),
					// options object passed to jquery.animate(css, options)
					$options = _this.anima('_$options', aoptions);

				$.when(_this.$el.animate($animation, $options))
					.then(_this.queue);
			});
		},


		// fetches the state object and animates the element to that state.
		__transitate: function(objective) {
			var _this = this,

			var promise = $.when(this.$el.animate($animation, $options));

			promise.then(function() {
				_this.set('stopped:' + objective, aoptions, insist);
			});

			// as .set is running synchronously, the special methods __enter and __leave 
			// will be called before the animation starts!!! Even this method having
			// been called after the animation function
			this.fsm('set','on-transition:'+objective, aoptions, insist);

			return promise;
		},

		/////////////////
		////// API //////
		/////////////////

		state: function(name, state) {
			/*
				state: {
					// jquery animation possibilities

					__options: {
						__before: function()
						__after: function()
					}
				}
			*/
			return _.getset({
				context: this,
				obj: '_astates',
				name: name,
				value: state,
				options: {
					// set evaluate to true, so that if the state returned is 
					// a function, then return the function's result instead of the 
					// function itself.
					evaluate: true
				}
			})
		},

		flow: function(states) {

		},

		// a method that checks if the transition should be executed
		checkObjective: function(objective) {
			// if objective is an array
		},
	};

	var Anima = Object.create(FSM);
	Anima.extend({
		init: function(options) {

			_.bindAll(this, 'anima');

			// object on which all animastates (astates) will be defined
			this._astates = {};

			// save the states provided by options
			this.anima('state', options.states);

			// el
			this.$el = options.$el;

			// save a reference to this object on the $el
			this.$el.data('anima', this);

			// the promises:
			// 1: general promise, completed when the full queue is complete
			this.promise = true;

			// the queue of states this element should pass through
			this.animaqueue = [];

			// INITIALIZE //
			// first transition: transitate(state, options, insist);
			this.transitate(options.initial, {}, true);
		},

		////////////////////////////////////////////////
		////// OVERWRITE FSM initial(data) method //////
		////////////////////////////////////////////////
		// this method is used to get the initial state of the machine
		// and it is passed the same arguments as the .init method
		initial: function(options) {
			var initialAttr = options.initialAttr || 'data-initial',
				initial = options.$el.attr(initialAttr);

			return 'on-transition:' + initial;
		},

		anima: function(method) {
			var args = _.args(arguments, 1);
			return anima[ method ].apply(this, args);
		},

		states: {
			'on-transition:*': {
				__enter: function(objective, aoptions) {
					// get the special option __before
					this.anima('_processAnimaSpecialOption', aoptions.__before);

					// emit event
					this.emit('enter', objective, this.$el, this);
					this.emit('enter:' + objective, this.$el, this);
				},

				__leave: function(objective, aoptions) {
					// get the special option __after
					this.anima('_processAnimaSpecialOption', aoptions.__after);

					/// EMIT EVENT ////
					this.emit('leave', objective, this.$el, this);
					this.emit('leave:' + objective, this.$el, this);
				}
			},

			'stopped:*': {
				__enter: function(current, aoptions) {
					this.emit(current, this.$el, this);
				},

				transitate: function(current, objective) {
					// when stopped, we must check if the objective and the current states
					// are equal.
					console.log(current, objective)
				}
			},

			'*': {
				transitate: function(token, objective, options, insist) {

					var current = token.split(':')[1];

					if (current === objective && !insist) {

						// return the promise object
						return this.promise;

					} else {

						// do the animation
						var _this = this,
							// astate is the original state object provided on state definition
							astate = this.anima('state', objective),
							// aoptions is the special property __options defined on the astate
							aoptions = astate.__options,

							// css object passed to jquery.animate(css, options)
							$animation = this.anima('_$animation', astate),
							// options object passed to jquery.animate(css, options)
							$options = this.anima('_$options', aoptions);

						// overwrite the options with the on call ones
						$options = _.extend({}, $options, options);

						// animation won't start until next tick of the processing.
						var promise = this.promise = $.when(this.$el.stop().animate($animation, $options)).then(function() {
							_this.set('stopped:'+objective, aoptions, insist);
						});

						// as .set is running synchronously, the special methods __enter and __leave 
						// will be called before the animation starts!!! Even this method having
						// been called after the animation function
						this.fsm('set','on-transition:'+objective, aoptions, insist);

						return promise;
					}
				},

				queue: function(token, objective, options) {

				},
			}
		}
	});

	

	///////////////////////////////
	/////// JQUERY PLUGIN /////////
	///////////////////////////////
	$.fn.anima = function(first, second, third) {

		if (typeof first === 'object' && !second && !third) {
			// initialization
			first.$el = this;

			return Anima.build(first);

		} else if (typeof first === 'string') {
			// method calling
			var obj = this.data('anima'),
				method = anima[ first ] || obj[ first ],
				args = _.args(arguments, 1);

			return method.apply(obj, args);
		}


	};


	return Anima;
});