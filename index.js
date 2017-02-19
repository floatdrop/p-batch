'use strict';

class PBatch {
	constructor(loader, opts) {
		opts = Object.assign({
			maxBatchSize: Infinity
		}, opts);

		this.loader = loader;
		this.maxBatchSize = opts.maxBatchSize;
		this._keysQueue = [];
		this._promisesQueue = [];
	}

	dispatch() {
		if (this._keysQueue.length === 0) {
			return;
		}

		const keys = this._keysQueue;
		const promises = this._promisesQueue;
		this._keysQueue = [];
		this._promisesQueue = [];

		Promise.resolve(this.loader(keys))
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
	}

	add(key) {
		if (this._keysQueue.length === 0) {
			process.nextTick(() => this.dispatch());
		}

		return new Promise((resolve, reject) => {
			this._keysQueue.push(key);
			this._promisesQueue.push({resolve, reject});

			if (this._keysQueue.length >= this.maxBatchSize) {
				this.dispatch();
			}
		});
	}
}

module.exports = PBatch;
