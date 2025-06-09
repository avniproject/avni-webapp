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

  // New method to get user-friendly error messages based on HTTP status codes
  static getUserFriendlyErrorMessage(error) {
    const status = _.get(error, "response.status") || _.get(error, "status");

    // Define specific messages for common error codes
    switch (status) {
      case 403:
        return {
          message: "You don't have permission to access this resource. Please contact your administrator if you need access.",
          title: "Access Denied",
          display: true
        };
      case 404:
        return {
          message: "The resource you're looking for could not be found.",
          title: "Not Found",
          display: true
        };
      case 500:
        return {
          message: "The server encountered an error. Please try again later.",
          title: "Server Error",
          display: true
        };
      case 503:
        return {
          message: "The server is currently unavailable. Please try again later.",
          title: "Server Unavailable",
          display: true
        };
      default:
        // Check for network errors (when server is completely unreachable)
        if (
          error.message &&
          (error.message.includes("Network Error") ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("ERR_CONNECTION_REFUSED"))
        ) {
          return {
            message: "Cannot connect to server. Please check your internet connection and try again.",
            title: "Connection Error",
            display: true
          };
        }

        // Default fallback error message
        return {
          message: "An unexpected error occurred. Please try again later.",
          title: "Error",
          display: true
        };
    }
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
