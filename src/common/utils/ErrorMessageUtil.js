class ErrorMessageUtil {
  static getMessageType1(error) {
    return { message: `${error.message}. Something went wrong please try later`, display: true };
  }
}

export default ErrorMessageUtil;
