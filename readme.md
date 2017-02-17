# p-batch [![Build Status](https://travis-ci.org/floatdrop/p-batch.svg?branch=master)](https://travis-ci.org/floatdrop/p-batch)

> Batch async operations


## Install

```
$ npm install --save p-batch
```


## Usage

```js
const PBatch = require('p-batch');

batch = new PBatch(keys => {
	console.log('Batching', keys);
	return Promise.resolve(keys.map(k => k + 1));
});

const results = await Promise.all([1, 2, 3, 4, 5].map(key => batch.add(key));

// first logs "Batching [1, 2, 3, 4, 5]"
// results will contain [2, 3, 4, 5, 6]
```


## API

### PBatch(loader, [options])

Returns a new `batch` instance.

#### loader

Type: `Function`

Loader function. Accepts array of batched keys and must return Promise, that resolves to array of results or rejects with array of errors (or plain error, that will propagate to all promises).

#### options

##### maxBatchSize

Type: `number`<br>
Default: `Infinity`

Maximum batch size.

### batch

`PBatch` instance.

#### .add(key)

Adds key to current batch. If batch is empty – schedules dispatch on next tick.


## License

MIT © [Vsevolod Strukchinsky](http://github.com/floatdrop)
