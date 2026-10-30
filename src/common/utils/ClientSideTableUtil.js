import _ from "lodash";
import StringUtil from "./StringUtil";

class ClientSideTableUtil {
  static compareValues(a, b) {
    if (_.isNumber(a) && _.isNumber(b)) return a - b;
    return StringUtil.compareIgnoringCase(a, b);
  }

  static sortAndPage(rows, { page, pageSize, orderBy, orderDirection }) {
    const sortedRows = orderBy
      ? [...rows].sort((a, b) => {
          const comparison = ClientSideTableUtil.compareValues(_.get(a, orderBy), _.get(b, orderBy));
          return orderDirection === "desc" ? -comparison : comparison;
        })
      : rows;
    const start = page * pageSize;
    return {
      data: sortedRows.slice(start, start + pageSize),
      totalCount: rows.length,
    };
  }
}

export default ClientSideTableUtil;
