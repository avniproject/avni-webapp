import _ from "lodash";

class StringUtil {
  static substring(str, length) {
    if (_.isEmpty(str)) return str;
    return str.length > length ? str.substring(0, length) : str;
  }
}

export default StringUtil;
