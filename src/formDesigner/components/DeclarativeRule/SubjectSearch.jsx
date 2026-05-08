import { map } from "lodash";
import { httpClient as http } from "../../../common/utils/httpClient";
import CommonSearch from "../../common/CommonSearch";

const SubjectSearch = ({
  value,
  onChange,
  isMulti,
  placeholder,
  defaultOptions = [],
  subjectTypeUuid,
}) => {
  const loadSubjects = (input, callback) => {
    if (!subjectTypeUuid) {
      callback([]);
      return;
    }
    http
      .post("/web/searchAPI/v2", {
        name: input,
        subjectType: subjectTypeUuid,
        pageElement: { numberOfRecordPerPage: 20 },
      })
      .then((response) => {
        const subjects = response?.data?.listOfRecords || [];
        const options = map(subjects, ({ fullName, uuid }) => ({
          label: fullName,
          value: { name: fullName, uuid, toString: () => uuid },
        }));
        callback(options);
      });
  };

  return (
    <CommonSearch
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      placeholder={placeholder || "Type to search subject"}
      defaultOptions={defaultOptions}
      loadOptionsByValue={loadSubjects}
    />
  );
};

export default SubjectSearch;
