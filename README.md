## Run app

### Install dependencies

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
