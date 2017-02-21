'use strict';

class PBatch {
	constructor(loader, opts) {
		opts = Object.assign({
			maxBatchSize: Infinity,
			dispatchSignal: fn => process.nextTick(fn)
		}, opts);

		this.loader = loader;
		this.maxBatchSize = opts.maxBatchSize;
		this.dispatchSignal = opts.dispatchSignal;
		this._batch = [];
		this._promisesQueue = [];
	}

	dispatch() {
		if (this._batch.length === 0) {
			return;
		}

		const keys = this._batch;
		const promises = this._promisesQueue;
		this._batch = [];
		this._promisesQueue = [];

		const promise = Promise.resolve(this.loader(keys));
		promise
			.then(results => {
				for (let i = 0; i < promises.length; ++i) {
					promises[i].resolve(results[i]);
				}
			})
			.catch(err => {
				for (let i = 0; i < promises.length; ++i) {
					if (Array.isArray(err)) {
						promises[i].reject(err[i]);
					} else {
						promises[i].reject(err);
					}
				}
			});

		return promise;
	}

	add(key) {
		return new Promise((resolve, reject) => {
			this._batch.push(key);
			this._promisesQueue.push({resolve, reject});

			if (this._batch.length >= this.maxBatchSize) {
				return this.dispatch();
			}

			if (this._batch.length === 1) {
				this.dispatchSignal(() => this.dispatch());
			}
		});
	}

	addAll(keys) {
		return Promise.all(keys.map(key => this.add(key)));
	}
}

module.exports = PBatch;
