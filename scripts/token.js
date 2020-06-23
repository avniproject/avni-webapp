const tokenFn = require("openchs-idi/token");

const [serverUrl, user, password] = process.argv.slice(2);

tokenFn({ serverUrl, user, password })
  .then(token => {
    console.log("", token);
  })
  .catch(error => {
    console.log(error, "+++");
  });
