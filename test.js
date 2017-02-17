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

test('reject with array of errors', async t => {
	const pBatch = new PBatch(keys => new Promise((resolve, reject) => {
		reject(keys);
	}));

	await Promise.all([1, 2, 3, 4, 5].map(key => pBatch.add(key).catch(err => t.is(err, key))));
});
