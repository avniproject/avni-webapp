## Dev environment

To enable Cognito authentication in dev environment 
set `REACT_APP_COGNITO_IN_DEV=true` in `.env.development.local`

This requires the following env variables to be set as well:
* REACT_APP_AWS_REGION
* REACT_APP_COGNITO_USER_POOL_ID
* REACT_APP_COGNITO_APP_CLIENT_ID

---
It is recommended to use `yarn` instead of `npm`. (yarn is 
faster and we already have everything in `yarn.lock`)

---
#### File/folder structure  

* Folders per route/feature
  (See https://marmelab.com/blog/2015/12/17/react-directory-structure.html)
* Reducers and actions in 'ducks' structure (See https://github.com/erikras/ducks-modular-redux)
