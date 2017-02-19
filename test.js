import test from 'ava';
import PBatch from '.';

test('multiple keys', async t => {
	const pBatch = new PBatch(keys => new Promise(resolve => {
		t.is(keys.length, 5);
		resolve(keys.map(key => key + 1));
	}));

	const result = await Promise.all(
		[0, 1, 2, 3, 4].map(key => pBatch.add(key))
	);

	t.deepEqual(result, [1, 2, 3, 4, 5]);
});

test('maxBatchSize', async t => {
	const pBatch = new PBatch(keys => new Promise(resolve => {
		t.is(keys.length, 3);
		resolve(keys.map(key => key + keys.length));
	}), {
		maxBatchSize: 3
	});

	const result = await Promise.all(
		[0, 1, 2, -1, -2, -3].map(key => pBatch.add(key))
	);

	t.deepEqual(result, [3, 4, 5, 2, 1, 0]);
});

test('reject with error', async t => {
	const pBatch = new PBatch(() => new Promise((resolve, reject) => reject(1)));
	await Promise.all([1, 2, 3, 4, 5].map(key => pBatch.add(key).catch(err => t.is(err, 1))));
});

test('reject with array of errors', async t => {
	const pBatch = new PBatch(keys => new Promise((resolve, reject) => reject(keys)));
	await Promise.all([1, 2, 3, 4, 5].map(key => pBatch.add(key).catch(err => t.is(err, key))));
});

test('accepts sync function as loader', async t => {
	const pBatch = new PBatch(keys => keys);
	const result = await Promise.all([1, 2, 3, 4, 5].map(key => pBatch.add(key)));
	t.deepEqual(result, [1, 2, 3, 4, 5]);
});

test('dispatch method', async t => {
	const results = [];
	const pBatch = new PBatch(keys => results.push(keys));
	pBatch.add(1);
	pBatch.add(2);
	pBatch.dispatch();
	await pBatch.add(3);

	t.deepEqual(results, [[1, 2], [3]]);
});

test('dispatchSignal', async t => {
	const results = [];
	const pBatch = new PBatch(keys => results.push(keys), {
		onKey: () => pBatch.dispatch()
	});
	await Promise.all([pBatch.add(1), pBatch.add(2)]);

	t.deepEqual(results, [[1], [2]]);
});
