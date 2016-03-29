import path from 'path';
import { chain, directory } from 'exhibit';

export default class Suite {
	constructor({ name, fixturesDir, numbers, plugin }) {
		this.name = name;

		this.steps = numbers.map(number => ({
			number,
			in: directory(fixturesDir, `${name}-${number}-in`),
			out: directory(fixturesDir, `${name}-${number}-out`),
		}));

		const configScript = path.join(fixturesDir, name);
		const config = require(configScript);

		this.subject = chain((plugin.default || plugin).apply(null, config));
		if (Array.isArray(this.subject)) {
			throw new TypeError(`Config script does not export an array: ${configScript}`);
		}
	}

	async run() {
		console.log('\nRunning test suite: ' + this.name);

		for (const step of this.steps) {
			const [expectedOutFiles, actualOutFiles] = await Promise.all([
				step.out.read(),
				step.in.read().then(this.subject),
			]);

			if (!expectedOutFiles.equals(actualOutFiles)) {
				console.error(`Step #${step.number} failed`);
				console.error('  Expected output:', expectedOutFiles);
				console.error('    Actual output:', actualOutFiles);

				throw new Error(`Step #${step.number} failed`);
			}
		}
	}

	async fix() {
		console.log('\nFixing test suite: ' + this.name);

		for (const step of this.steps) {
			await step.in.read().then(this.subject).then(step.out.write);
		}
	}
}
