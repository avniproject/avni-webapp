import { first } from "lodash";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SelectSubject from "../../../../common/components/subject/SelectSubject";

const FindRelativeTable = ({ subjectData, errormsg }) => {
  const { t } = useTranslation();
  const Relations = useSelector(state => state.dataEntry.relations);
  const subjects = useSelector(state => state.dataEntry.search.subjects);
  const searchParams = useSelector(
    state => state.dataEntry.search.subjectSearchParams
  );
  const subjectTypes = useSelector(state =>
    first(state.dataEntry.metadata.operationalModules.subjectTypes)
  );

  const onSelectedItem = row => {
    sessionStorage.setItem("selectedRelative", JSON.stringify(row));
  };

  return (
    <SelectSubject
      t={t}
      errormsg={errormsg}
      subjectData={subjectData}
      onSelectedItem={onSelectedItem}
    />
  );
};

export default FindRelativeTable;
