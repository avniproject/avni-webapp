import _ from "lodash";

class ErrorMessageUtil {
  static getMessageType1(error) {
    return { message: `${error.message}. Something went wrong please try later`, display: true };
  }

  static getWindowUnhandledError(error) {
    return {
      message: `${_.get(error, "reason.message")}. ${_.get(error, "status")}`,
      stack: error.stack
    };
  }
}

export default ErrorMessageUtil;
