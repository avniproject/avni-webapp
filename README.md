CI [![CircleCI](https://circleci.com/gh/OpenCHS/openchs-webapp.svg?style=svg)](https://circleci.com/gh/OpenCHS/openchs-webapp)

## Run app

You will need yarn package mananger to be installed globally to run this project. Follow the instructions on https://yarnpkg.com/en/docs/install to install yarn if it is not already installed on your machine.

### Install dependencies
Once yarn is installed run the following:
```
yarn install
```
### Start webapp

```
# openchs server should be running and accessible at port 8021
yarn start
```

### To enable Cognito authentication in dev environment [Optional]
set `REACT_APP_COGNITO_IN_DEV=true` in `.env.development.local`

This requires the following env variables to be set as well:
* REACT_APP_AWS_REGION
* REACT_APP_COGNITO_USER_POOL_ID
* REACT_APP_COGNITO_APP_CLIENT_ID

## Implementing new features
### File/folder structure  

* Folders per route/feature
  (See https://marmelab.com/blog/2015/12/17/react-directory-structure.html)
* Reducers and actions in 'ducks' structure (See https://github.com/erikras/ducks-modular-redux)

### Code Style

- We use Prettier for javascript/jsx formatting. You can use your IDE/Editor specific Plugin to format code using Prettier. Alternatively there is also a command `yarn prettier-all` that will format all files in src folder using Prettier. And there also is a git precommit hook that formats staged files using prettier before commiting.
