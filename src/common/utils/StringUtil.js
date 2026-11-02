import _ from "lodash";

class StringUtil {
  static substring(str, length) {
    if (_.isEmpty(str)) return str;
    return str.length > length ? str.substring(0, length) : str;
  }

  // Entity type names are stored trimmed (server side too), so trim before validating and saving.
  static trimName(name) {
    return _.isString(name) ? name.trim() : name;
  }
}

export default StringUtil;
