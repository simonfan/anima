require.config({
	urlArgs: "bust=" + Math.random(),
	baseUrl: '',
	paths: {
		// basic libraries
		'jquery': 'components/jquery/jquery',
		'underscore': 'components/underscore/underscore',
		'eventemitter2': 'components/eventemitter2/lib/eventemitter2',
		'json2': 'components/json2/json2',

		'buildable': 'components/buildable/buildable',
		'_.mixins': 'components/_.mixins/_.mixins',
		'taskrunner': 'components/taskrunner/taskrunner',

		// the module files go here
		'anima': '../anima',

		// DEMO
		'demo-main': 'demo',	// the main file for the demo

		// UNIT TESTS
		'tests-main': 'tests',	// the main file for tests

		// other tests go here
		'anima-tests': 'tests/anima_tests',
	},
	shim: {}
});
	
if (window.__unit) {

	// load the tests
	require(['tests-main'], function(undef) {

		// tests were already run in the main tests file

		// QUnit was set not to autostart inline in tests.html
		// finally start the QUnit engine.
		QUnit.load();
		QUnit.start();
	});

} else {

	require(['demo-main'], function(demo) {

	});

}