define(['jquery','fsm','cascade','underscore','_.mixins'], function($, FSM, Cascade, undef, undef) {

	// internally used methods.
	var anima = {


		// animate to one state
		_toState: function(statename) {
			var _this = this,
				astate = _this.anima('state', statename),
				aoptions = _this.anima('options', statename) || {};

			// if astate is a function, just run it. 
			// if it is an object, do jquery animation
			var promise = typeof astate === 'function' ? astate.call(this, this.$el) : $.when(this.$el.animate(astate, aoptions));

			// set state as stopped when this animation ends
			promise.then(function() { _this.fsm('set','stopped:' + statename); });

			// set the state as on-transition just before the animation starts
			this.fsm('set','on-transition:'+statename);

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
					// this refers to the anima object.
					evaluate: function(state) {

						// if state is an object, return an $animation object
						if (typeof state === 'object') {
							for (prop in state) {
								if (typeof state[ prop ] === 'function') {
									state[ prop ] = state[ prop ].call(this.$el, this);
								}
							}

						}

						return state;
					},
					iterate: function(name, state) {
						// clone the options and save them
						this.anima('options', name, _.clone(state.__options));

						// delete the options from the state object
						delete state.__options;

						return state;
					},
				}
			})
		},

		options: function(name, options) {
			return _.getset({
				context: this,
				obj: '_aoptions',
				name: name,
				value: options
			})
		},

		flow: function(sequence, insist) {
			// sequence may either be an array or a single state string
			// the objective is the LAST state of the sequence.
			var sequence = typeof sequence === 'string' ? [sequence] : sequence,
				objective = _.last(sequence);

			if ( !this.isNewObjective(objective) && !insist ) {

				// return the promise object
				return this.promise;

			} else {
				// set the flow queue as the sequence
				this.flowq = sequence;

				var _this = this,
					// build up a cascade object
					cascade = Cascade.build();

				// stop all aniations on the $el
				this.$el.stop();

				// add tasks to cascade
				_.each(sequence, function(statename, index) {
					cascade.add(function(defer, common) {
						return _this.anima('_toState', statename);
					});
				});

				// run the cascade and return the promise
				return this.promise = cascade.run();
			}
		}
	};

	var Anima = Object.create(FSM);
	Anima.extend({
		init: function(options) {

			_.bindAll(this, 'anima');

			// object on which all animastates (astates) will be defined
			this._astates = {};

			// object on which all aoptions will be deinfed
			this._aoptions = {};

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
			this.flowq = [];

			// INITIALIZE //
			// first transition: transitate(state, options, insist);
			this.flow(options.initial, {}, true);
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
			// all wild-card state functions receive the token value as the first parameter.
			'on-transition:*': {
				__enter: function(currObjective) {
					var aoptions = this.anima('options', currObjective);

					if (aoptions && aoptions.__before) {
						if (typeof aoptions.__before === 'object') {
							this.$el.css(aoptions.__before);
						} else if (typeof aoptions.__before === 'function') {
							aoptions.__before.call(this, this.$el);
						}
					}

					// emit event
					this.emit('enter', currObjective, this.$el, this);
					this.emit('enter:' + currObjective, this.$el, this);
				},

				__leave: function(currObjective) {
					var aoptions = this.anima('options', currObjective);

					if (aoptions && aoptions.__before) {
						if (typeof aoptions.__before === 'object') {
							this.$el.css(aoptions.__before);
						} else if (typeof aoptions.__before === 'function') {
							aoptions.__before.call(this, this.$el);
						}
					}

					/// EMIT EVENT ////
					this.emit('leave', currObjective, this.$el, this);
					this.emit('leave:' + currObjective, this.$el, this);
				},

				isNewObjective: function(currObjective, objective) {
					// as the currObjective only refers to 
					// the current transition, not to the queue,
					// compare the objective to the last item on the 
					// flow queue
					var finalObjective = _.last(this.flowq);

					return finalObjective !== objective;
				},
			},

			// all wild-card state functions receive the token value as the first parameter.
			'stopped:*': {
				__enter: function(currState, aoptions) {
					this.emit(currState, this.$el, this);
				},

				isNewObjective: function(currState, objective) {
					return currState !== objective;
				},
			},

			// all wild-card state functions receive the token value as the first parameter.
			'*': {
				flow: function(token, sequence, insist) {
					return this.anima('flow', sequence, insist);
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