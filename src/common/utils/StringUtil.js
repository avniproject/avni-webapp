import _ from "lodash";

class StringUtil {
  static substring(str, length) {
    if (_.isEmpty(str)) return str;
    return str.length > length ? str.substring(0, length) : str;
  }

  static anyContainsIgnoringCase(searchText, ...values) {
    if (_.isEmpty(_.trim(searchText))) return true;
    const lowerCaseSearchText = searchText.toLowerCase();
    return values.some((value) => !_.isNil(value) && String(value).toLowerCase().includes(lowerCaseSearchText));
  }

  static compareIgnoringCase(a, b) {
    return String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base" });
  }
}

export default StringUtil;
