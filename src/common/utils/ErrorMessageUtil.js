import _ from "lodash";

// https://javascript.info/promise-error-handling#unhandled-rejections
class UnhandledRejectionError {
  error;
  promiseError;

  constructor(error, promiseError) {
    this.error = error;
    this.promiseError = promiseError;
  }

  get message() {
    let message = "";
    let reasonMessage = _.get(this.error, "reason.message");
    if (_.isNil(reasonMessage)) {
      reasonMessage = _.get(this.error, "reason");
    }
    if (!_.isNil(reasonMessage)) {
      message += `${reasonMessage}.`;
    }

    const status = _.get(this.error, "status");
    if (!_.isNil(status)) {
      message += `${status}.`;
    }

    if (!_.isNil(this.promiseError)) {
      message += `Promise error message = ${this.promiseError.message}.`;
    }
    return message;
  }

  get stack() {
    let stack = "";
    if (!_.isNil(_.get(this, "error.stack"))) stack += this.error.stack;
    if (!_.isNil(_.get(this, "promiseError.stack"))) stack += `\n ${this.promiseError.stack}`;
    return stack;
  }
}

class ErrorMessageUtil {
  static getMessageType1(error) {
    return { message: `${error.message}. Something went wrong please try later`, display: true };
  }

  static fromWindowUnhandledError(error, callback) {
    const unhandledError = new UnhandledRejectionError(error);
    if (error.promise) {
      error.promise.catch(x => {
        unhandledError.promiseError = x;
        callback(unhandledError);
      });
    }

    return unhandledError;
  }
}

export default ErrorMessageUtil;
