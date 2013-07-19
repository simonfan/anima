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
						var res;

						if (typeof state === 'object') {
							// if the state is an object
							// for each property of the state, evaluate its value.
							// and copy the result to a new res object
							res = {};

							for (prop in state) {
								if (typeof state[ prop ] === 'function') {
									res[ prop ] = state[ prop ].call(this.$el, this);
								} else {
									res[ prop ] = state[ prop ];
								}
							}
						} else {
							// if type of state is not an object, just pass it on.
							res = state;
						}

						return res;
					},
					iterate: function(name, state) {
						// if state is an object, clone it so that the original may remain unaltered.
						// otherwise pass it on
						var savestate = typeof state === 'object' ? _.clone(state) : state;

						// clone the options and save them
						if (savestate.__options) {
							this.anima('options', name, _.clone(savestate.__options));

							// delete the options from the savestate object
							delete savestate.__options;
						}

						// return savestate instead of state object.
						return savestate;
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

			_.bindAll(this, 'anima','flow');

			// el
			this.$el = options.$el;

			// save a reference to this object on the $el
			this.$el.data('anima', this);

			// object on which all animastates (astates) will be defined
			this._astates = {};
			// commonstates is a 
			this.commonStates = options.commonStates;

			// object on which all aoptions will be deinfed
			this._aoptions = {};
			// commonOptions
			this.commonOptions = options.commonOptions;

			// save the states provided by options
			this.anima('state', options.states);

			// the promises:
			// 1: general promise, completed when the full queue is complete
			this.promise = true;

			// the queue of states this element should pass through
			this.flowq = [];

			// INITIALIZE //
			// get the initial state
			this.flow(options.initial, true);
		},

		////////////////////////////////////////////////
		////// OVERWRITE FSM initial(data) method //////
		////////////////////////////////////////////////
		// this method is used to get the initial state of the machine
		// and it is passed the same arguments as the .init method
		initial: function(options) {
			var initial = options.initial = typeof options.initial === 'string' ? options.initial : options.initial.call(this, options.$el);

			return 'on-transition:' + initial;
		},

		anima: function(method) {
			var args = _.args(arguments, 1);
			return anima[ method ].apply(this, args);
		},


		flow: anima.flow,

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
					return _.last(this.flowq) !== objective;
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