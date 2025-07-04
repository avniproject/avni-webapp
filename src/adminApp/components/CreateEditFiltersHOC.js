import { CreateEditFilters } from "./CreateEditFilters";
import { isNil } from "lodash";

export const CreateEditFiltersHOC = props => {
  if (isNil(props.history.location.state)) {
    return <div />;
  }
  const {
    omitTableData,
    selectedFilter,
    title,
    filterType,
    worklistUpdationRule,
    operationalModules,
    filename,
    settings
  } = props.history.location.state;

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
