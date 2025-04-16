# Avni Webapp

A web application for the Avni platform that provides admin interface, app designer, and data entry capabilities.

## Prerequisites

- Node.js (v20 or later) - Check .nvmrc for exact version
- Yarn package manager (latest version)
- Git
- A code editor (VS Code recommended)

You will need `yarn` package manager to be installed globally to run this project. Follow the instructions on https://yarnpkg.com/en/docs/install to install `yarn` if it is not already installed on your machine.
Once installed you can verify it by running `yarn -v` on terminal. It should return whatever is the latest version mentioned on https://yarnpkg.com/en/docs/install.

## Quick Start Guide

1. Fork and clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/avni-webapp.git
cd avni-webapp
```

2. Install dependencies:

```bash
make deps
```

## Setup

There are two possible ways to setup Avni Webapp for development:

1. Connect to the Hosted API Server: This is the easiest and fastest way to get started. You don’t need to set up a local PostgreSQL database or Java API server. This method is lightweight and ideal for contributors who want to focus on the webapp without worrying about backend dependencies.
2. Set Up a Local Development Environment: This involves setting up a local PostgreSQL database and running the Java API server locally. It’s more resource-intensive and complex but may be necessary for certain testing.

### 1. Setup to connect to hosted API Server (Samanvay hosted staging server)

1. Run `make start-with-staging`
2. Use the credentials : Username : `dummy@osc` and Password : `dummy@123`
3. After logging in please create a new user for yourself and use that .

### 2. Setup to connect to your local API Server

1. Start your Java Server. For this refer to [product development setup document](https://avni.readme.io/docs/developer-environment-setup-ubuntu#server-side-components).
2. Run `make start` in avni-webapp directory.
3. It will assume whatever user you started the Java Server with since we don't do authentication when running the server locally. If you want to change the user then restart the webapp after setting environment variable `REACT_APP_DEV_ENV_USER` to user you want. E.g. start the server like `REACT_APP_DEV_ENV_USER=ihmp-admin make start`.

## Common Setup Issues & Solutions

1. **Node Version Mismatch**

   - Use nvm to switch to the correct Node version: `nvm use`
   - Install the required version if needed: `nvm install 20`

2. **Yarn Installation Issues**

   - Clear yarn cache: `yarn cache clean`
   - Remove node_modules: `rm -rf node_modules`
   - Reinstall dependencies: `yarn install`

3. **Port Already in Use**
   - Check what's using port 6010: `lsof -i :6010`
   - Kill the process if needed: `kill -9 PID`

## Development Workflow

1. **Running Tests**

```bash
make test           # Run all tests
make test-only     # Run tests without building
make cy-run        # Run Cypress tests
```

2. **Code Formatting**

```bash
make prettier-all  # Format all files
```

## Contributing

### Before Creating a Pull Request

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test them:

```bash
make test
make prettier-all
```

3. Commit your changes:

```bash
git add .
git commit -m "descriptive commit message"
```

4. Push to your fork:

```bash
git push origin feature/your-feature-name
```

#### Pull requests

- Please make sure that your code follows guidelines given in https://avni.readme.io/v2.0/docs/contribution-guide.
- Ensure all tests pass
- Update documentation if needed
- Add screenshots for UI changes

#### File/folder structure

- There are multiple apps inside this repository
  - Admin (Allow admins to do admin work like creating organisations, users, locations)
  - App Designer (Allow admins to design the app)
  - Reports (Allow admins to download longitudnal reports)
  - Translations (Allow admins to upload translations)
  - Data Entry App (Allow users to do data entry using web based app)
- Folders per route/feature
  (See https://marmelab.com/blog/2015/12/17/react-directory-structure.html)
- Reducers and actions in 'ducks' structure (See https://github.com/erikras/ducks-modular-redux). This is not applicable for App Designer as it does not use Redux.

#### Code Style

- We use Prettier for javascript/jsx formatting. You can use your IDE/Editor specific Plugin to format code using Prettier. Alternatively there is also a command `make prettier-all` that will format all files in src folder using Prettier. And there also is a git precommit hook that formats staged files using prettier before commiting.

#### Continuous Integration

All commits are built and tested and deployed to staging if tests succeed. Build status can be seen at https://circleci.com/gh/OpenCHS/openchs-webapp. Please run tests using `make test` before you push your code so you don't end up breaking things unnecessarily.
