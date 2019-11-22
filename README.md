## Run app

You will need yarn package mananger to be installed globally to run this project. Follow the instructions on https://yarnpkg.com/en/docs/install to install yarn if it is not already installed on your machine.

### Install dependencies

Once yarn is installed run the following:

```
yarn install
```

### Start Server

Start server with dev user of whatever implementation you are using.
E.g. if you are running Ayu implementation then run following command:

```
OPENCHS_USER_NAME=dev@ayu make start_server
```

This will start the server and make it accessible at port 8021.

### To start webapp for Admin tasks like adding a form or adding a catchment etc...

Set value of REACT_APP_DEV_ENV_USER enviornment variable to admin user of your implementation and run `yarn start` after that. E.g. if you are running Ayu implementation then you can run command like:

```
REACT_APP_DEV_ENV_USER=admin@ayu yarn start
```


### To start webapp for Data Entry

Set value of REACT_APP_DEV_ENV_USER enviornment variable to dev user of your implementation and run `yarn start` after that. E.g. if you are running Ayu implementation then you can run command like:

```
REACT_APP_DEV_ENV_USER=dev@ayu yarn start
```

### To enable Cognito authentication in dev environment [Optional]

set `REACT_APP_COGNITO_IN_DEV=true` in `.env.development.local`

This requires the following env variables to be set as well:

- REACT_APP_AWS_REGION
- REACT_APP_COGNITO_USER_POOL_ID
- REACT_APP_COGNITO_APP_CLIENT_ID

## Implementing new features

### File/folder structure

- Folders per route/feature
  (See https://marmelab.com/blog/2015/12/17/react-directory-structure.html)
- Reducers and actions in 'ducks' structure (See https://github.com/erikras/ducks-modular-redux)

### Code Style

- We use Prettier for javascript/jsx formatting. You can use your IDE/Editor specific Plugin to format code using Prettier. Alternatively there is also a command `yarn prettier-all` that will format all files in src folder using Prettier. And there also is a git precommit hook that formats staged files using prettier before commiting.

### Continuous Integration
All commits are built and tested and deployed to staging if tests succeed. Build status can be seen at https://circleci.com/gh/OpenCHS/openchs-webapp. Please run tests using `yarn test` before you push your code so you don't end up breaking things unnecessarily.
