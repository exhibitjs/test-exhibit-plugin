# test-exhibit-plugin

CLI for testing a plugin module. Designed to be used as the `test` script in the plugin's `package.json`.

## Usage

```sh
> test-exhibit-plugin FIXTURES_DIR
```

`FIXTURES_DIR` defaults to `./fixtures`.

- `--fix` – set this to destructively overwrite all the `*-out` directories. Useful when first setting up your tests.
- `--cwd=DIR` (default: current working directory) – set this to manually override it. Should be the root of the plugin module, i.e. the directory its package.json is in.

## Defining fixtures

In your plugin's `./fixtures` directory, you can have one or more named 'suites'. A suite's name should be something like `foo` or `foo-bar` (i.e. lower-case alphanumeric characters and hyphens only).

- `foo.js` – config definition for the foo suite – should export an array of arguments intended to be applied to the plugin to make the builder for this suite
- `foo-0-in` – directory containing input files
- `foo-0-out` – directory containing expected output files

Optionally followed by:

- `foo-1-in`
- `foo-1-out`
- `foo-2-in`
- `foo-2-out`
- etc. for as a many extra steps as you need.

### Note on numbering

For many cases you probably only need one step, but numbers are still required for consistency.

The point of the numbering is that for any given suite, the same plugin instance (configured builder function) will be used for every step, so you can verify things like caching works OK.
