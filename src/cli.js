#!/usr/bin/env node

import 'loud-rejection/register';
import 'source-map-support/register';
import figures from 'figures';
import minimist from 'minimist';
import path from 'path';
import sander from 'sander';
import Suite from './Suite';
import { magenta, red, green } from 'chalk';

const argv = minimist(process.argv.slice(2), {
	default: {
		cwd: process.cwd(),
	},
});

const fixturesDir = argv._[0] ? path.resolve(argv._[0]) : path.join(argv.cwd, 'fixtures');

const plugin = require(argv.cwd);

console.log(magenta('\nScanning for fixtures in'), fixturesDir);

const configRegex = /^([a-z]([a-z]|(-(?!-)))+[a-z])\.js$/;

function fail(message) {
	console.log('\n' + red(figures.cross) + ' ' + message);
	process.exit(1);
}

async function go() {
	let list;

	try {
		list = await sander.readdir(fixturesDir);
	}
	catch (error) {
		if (error.code !== 'ENOENT') throw error;

		fail('Directory not found: ' + fixturesDir);
	}

	// load all the test suites into memory
	const suites = [];
	for (const name of list) {
		const configResult = configRegex.exec(name);
		if (configResult) {
			const [, suiteName] = configResult;

			const numbers = list.map(n => {
				if (n.startsWith(`${suiteName}-`) && n.endsWith('-in')) {
					return n.substring(suiteName.length + 1).split('-')[0];
				}
				return null;
			}).filter(x => x !== null);

			suites.push(new Suite({
				name: suiteName,
				plugin,
				numbers,
				fixturesDir,
			}));
		}
	}

	// run the suites in series
	let numFailures = 0;

	for (const suite of suites) {
		try {
			if (argv.fix) await suite.fix();
			else await suite.run();
		}
		catch (error) {
			numFailures++;
			console.error('\n' + error.stack + '\n');
		}
	}

	if (numFailures) fail(`${numFailures} suites failed.`);

	console.log('\n' + green(figures.tick) + ` ${suites.length} suites passed.`);
}

go();
