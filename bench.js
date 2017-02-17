'use strict';
const Benchmark = require('benchmark');
const Dataloader = require('dataloader');
const PBatch = require('./');

const suite = new Benchmark.Suite();

const KEYS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

suite
	.add('PBatch', deferred => {
		const batch = new PBatch(keys => Promise.resolve(keys));
		Promise.all(KEYS.map(key => batch.add(key))).then(() => deferred.resolve());
	}, {
		defer: true
	})
	.add('dataloader', deferred => {
		const loader = new Dataloader(keys => Promise.resolve(keys), {
			cache: false
		});
		Promise.all(KEYS.map(key => loader.load(key))).then(() => deferred.resolve());
	}, {
		defer: true
	})
	.on('cycle', event => {
		console.log(String(event.target));
	})
	.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
.run({
	async: true
});
