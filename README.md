# cs453 Demo API Server
Example Node (Express + Prisma) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) API spec.

## Getting Started

### Prerequisites

Run the following command to install dependencies:

```shell
npm install
```

### Environment variables

This project depends on some environment variables.
If you are running this project locally, create a `.env` file at the root for these variables.
Your host provider should included a feature to set them there directly to avoid exposing them.

Here are the required ones:

```
DATABASE_URL=
JWT_SECRET=
NODE_ENV=production
```

### Generate your Prisma client

Run the following command to generate the Prisma Client which will include types based on your database schema:

```shell
npx prisma generate
```

### Apply any SQL migration script

Run the following command to create/update your database based on existing sql migration scripts:

```shell
npx prisma migrate deploy
```

### Run the project

Run the following command to run the project:

```shell
npx nx serve api
```

### Seed the database

The project includes a seed script to populate the database:

```shell
npx prisma db seed
```

## Testing with Jest

This project uses [Jest](https://jestjs.io/) for unit and integration testing.

### Install Jest

Run the following command to install Jest and its TypeScript support:

```shell
npm install --save-dev jest ts-jest @types/jest
```

### Configure Jest

You can initialize a basic Jest configuration for TypeScript with:

```shell
npx ts-jest config:init
```

This will create a `jest.config.js` file in your project root. Make sure your configuration includes at least the following:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
```

- `preset: 'ts-jest'` enables Jest to work with TypeScript.
- `testEnvironment: 'node'` sets the environment for Node.js.
- `testMatch` specifies the pattern for test files.

### Run Tests

To run all tests, use:

```shell
npx jest
```

Or, if you have a test script in your `package.json`:

```shell
npm test
```

### Test Coverage

Jest can generate a test coverage report to show how much of your code is tested.

To run tests with coverage, use:

```shell
npx jest --coverage
```

Or, if using npm scripts:

```shell
npm test -- --coverage
```

After running, a summary will be shown in the terminal, and a detailed HTML report will be generated in the `coverage/lcov-report/index.html` file. Open this file in your browser to view the coverage details.

You can also add a script to your `package.json` for convenience:

```json
"scripts": {
  "test:coverage": "jest --coverage"
}
```

Then run:

```shell
npm run test:coverage
```

## Mutation Testing with Stryker

This project can use [Stryker](https://stryker-mutator.io/) for mutation testing to measure the effectiveness of your test suite.

### Install Stryker

Run the following command to install Stryker and its TypeScript/Jest plugins:

```shell
npm install --save-dev @stryker-mutator/core @stryker-mutator/typescript-checker @stryker-mutator/jest-runner
```

### Configure Stryker

You can initialize a Stryker configuration file with:

```shell
npx stryker init
```

During the setup, select Jest as your test runner and TypeScript as your language. This will create a `stryker.conf.js` file. A minimal example configuration might look like:

```js
module.exports = function(config) {
  config.set({
    mutate: ['src/**/*.ts'],
    testRunner: 'jest',
    jest: {},
    reporters: ['html', 'clear-text', 'progress'],
    coverageAnalysis: 'off',
  });
};
```

- `mutate` specifies which files to mutate.
- `testRunner` should be set to `'jest'`.
- `reporters` controls the output format.

### Run Mutation Tests

To run mutation testing, use:

```shell
npx stryker run
```

After the run, open the generated `reports/mutation/html/index.html` file in your browser to view the detailed mutation testing report.

## Deploy on a remote server

Run the following command to:
- install dependencies
- apply any new migration sql scripts
- run the server

```shell
npm ci && npx prisma migrate deploy && node dist/api/main.js
```