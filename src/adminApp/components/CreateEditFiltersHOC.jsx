import { useLocation, useNavigate } from "react-router-dom";
import { isNil } from "lodash";
import { CreateEditFilters } from "./CreateEditFilters";

const CreateEditFiltersHOC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    omitTableData,
    selectedFilter,
    title,
    filterType,
    worklistUpdationRule,
    operationalModules,
    filename,
    settings
  } = location.state || {};

  if (isNil(location.state)) {
    navigate("/");
    return <div />;
  }

  return (
    <CreateEditFilters
      omitTableData={omitTableData}
      selectedFilter={selectedFilter}
      title={title}
      filterType={filterType}
      worklistUpdationRule={worklistUpdationRule}
      operationalModules={operationalModules}
      settings={settings}
      documentationFileName={filename}
    />
  );
};

export default CreateEditFiltersHOC;
