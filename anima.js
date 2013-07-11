define(['jquery','fsm','gs','underscore','_.mixins'], function($, FSM, GS, _, undef) {

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

		/////////////////
		////// API //////
		/////////////////
		state: function(name, state, options) {
			if (typeof name === 'object' && typeof state === 'object') {
				// assume state is actually an options object
				_this.anima('options', state);
			}

			return this.gs(this._animaStates, name, state);
		},

		options: function(name, options) {
			return this.gs(this._animaOptions, name, options);
		}
	};

	var Anima = Object.create(FSM);
	Anima.extend(GS, {
		init: function(options) {

			_.bindAll(this, 'anima');

			this._animaStates = options.animaStates || {};
			this._animaOptions = options.animaOptions || {};

			// el
			this.$el = options.$el;

			// save a reference to this object on the $el
			this.$el.data('anima', this);

			// the promise
			this.promise = true;

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
				__enter: function(objective, aoptions) {
					this.emit(objective, this.$el, this);
				},
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
							astate = this.anima('state', objective),
							aoptions = this.anima('options', objective);

						// overwrite the options with the on call ones
						aoptions = _.extend({}, aoptions, options);

						// animation won't start until next tick of the processing.
						var promise = this.promise = $.when(this.$el.stop().animate(astate, aoptions)).then(function() {
							_this.set('stopped:'+objective, aoptions, insist);
						});

						// as .set is running synchronously, the special methods __enter and __leave 
						// will be called before the animation starts!!! Even this method having
						// been called after the animation function
						this.fsm('set','on-transition:'+objective, aoptions, insist);

						return promise;
					}
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