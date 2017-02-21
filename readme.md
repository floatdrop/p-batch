# p-batch [![Build Status](https://travis-ci.org/floatdrop/p-batch.svg?branch=master)](https://travis-ci.org/floatdrop/p-batch)

> Batch async operations

Useful, when you have batch endpoint (that can accept multiple queries at once) and want to group requests to this endpoint.


## Install

```
$ npm install --save p-batch
```


## Usage

```js
const PBatch = require('p-batch');

batch = new PBatch(keys => {
	console.log('Batching', keys);
	return keys.map(k => k + 1);
}, {
	maxBatchSize: 3
});

const results = await Promise.all([1, 2, 3, 4, 5].map(key => batch.add(key));

// first logs "Batching [1, 2, 3]"
// then       "Batching [4, 5]"
// results will contain [2, 3, 4, 5, 6]
```

For more loader examples you can look at [Facebook dataloader examples](https://github.com/facebook/dataloader/tree/master/examples) folder.


## API

### PBatch(loader, [options])

Returns a new `batch` instance.

#### loader

Type: `Function`

Loader function. Accepts array of batched keys and returns array of results or throws with array of errors (or plain error, that will propagate to all promises).

#### options

##### maxBatchSize

Type: `number`<br>
Default: `Infinity`

Maximum batch size.

##### dispatchSignal

Type: `Function`<br>
Default: `fn => process.nextTick(fn)`

Executed after first key put in batch. It should call it's first argument, when it is time for dispatching.

Useful, if you need to wait constant time after last key batching for ex.

### batch

`PBatch` instance.

#### .add(key)

Adds key to current batch. If batch is empty – schedules dispatch on next tick.

#### .addAll(keys)

Shortcut for `Promise.all(keys.map(key => batch.add(key)))`.

#### .dispatch()

Runs `loader` on batched keys. Useful, when batch should be dispatched right now.

By default current batch will be dispatched on next tick.


## Related

- [delay](https://github.com/sindresorhus/delay) - Delay a promise a specified amount of time
- [More…](https://github.com/sindresorhus/promise-fun)


## License

MIT © [Vsevolod Strukchinsky](http://github.com/floatdrop)
