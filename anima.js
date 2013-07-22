define(['jquery','taskrunner','underscore','_.mixins'], function($, TaskRunner, undef, undef) {

	// internally used methods.
	var anima = {
		// animate to one state
		_toState: function(statename) {
			var _this = this,
				astate = this.anima('state', statename),
				aoptions = this.anima('options', statename) || {};


			/////////////////////////
			///// 1: run before /////
			/////////////////////////
			if (aoptions && aoptions.__before) {
				if (typeof aoptions.__before === 'object') {
					this.$el.css(aoptions.__before);
				} else if (typeof aoptions.__before === 'function') {
					aoptions.__before.call(this, this.$el);
				}
			}


			////////////////////////////////
			////// 2: run the animation ////
			////////////////////////////////
			// if astate is a function, just run it. 
			// if it is an object, do jquery animation
			var promise = typeof astate === 'function' ? astate.call(this, this.$el) : $.when(this.$el.animate(astate, aoptions));


			////////////////////////////
			////// 3: run the after ////
			////////////////////////////
			// set state as stopped when this animation ends
			promise.then(function() {
				if (aoptions && aoptions.__after) {
					if (typeof aoptions.__after === 'object') {
						_this.$el.css(aoptions.__after);
					} else if (typeof aoptions.__after === 'function') {
						aoptions.__after.call(_this, _this.$el);
					}
				}
			});

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

			var _this = this;


			/////////////////////////////
			/// 2: save the state obj ///
			/////////////////////////////
			return _.getset({
				context: this,
				obj: '_astates',
				name: name,
				value: state,
				options: {
					iterate: function(name, state) {
						/*
							When a state is defined, the task that will execute the 
							state should be also defined
						*/
						/////////////////////////
						/// 1: save the task ////
						/////////////////////////
						this.taskrunner('task', name, function() {
							return _this.anima('_toState', name);
						});




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

			sequence = typeof sequence === 'string' ? [sequence] : sequence;

			// taskrunner run method receives: tasknames, insist, common object to be passed to each task.
			return this.taskrunner('run', sequence, insist, {});
		}
	};

	var Anima = Object.create(TaskRunner);
	Anima.extend({
		init: function(options) {

			/*
				options: {
					id: 'string' or undefined (defaults to $el.prop('id'))
					$el: jquery object,

					// optional: states
					states: object
				}
			*/

			_.bindAll(this, 'anima','flow');

			// el
			this.$el = options.$el;
			this.id = options.id || this.$el.prop('id');

			// save a reference to this object on the $el
			this.$el.data('anima', this);

			// save the states provided by options
			this.anima('state', options.states);
		},

		anima: function(method) {
			var args = _.args(arguments, 1);
			return anima[ method ].apply(this, args);
		},


		flow: anima.flow,

		/////////////////////////////////////////////////
		////// OVERWRITE taskrunner condition method ////
		/////////////////////////////////////////////////
		// RECEIVES: queue, tasks
		condition: function(currentQueue, tasks) {
			if (_.isArray(currentQueue)) {
				// if currentQueue is an array of task names
				// check if destinations match

				return _.last(currentQueue) !== _.last(tasks);

			} else if (!currentQueue) {
				// currentQueue not set
				return true;
			}
		},
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