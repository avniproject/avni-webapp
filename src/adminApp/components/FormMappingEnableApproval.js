import React from "react";
import { find, get, map } from "lodash";
import Checkbox from "@material-ui/core/Checkbox";
import MaterialTable from "material-table";
import Typography from "@material-ui/core/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import { CustomisedExpansionPanelSummary } from "./CustomisedExpansionPanelSummary";

export const FormMappingEnableApproval = ({
  formMappingState,
  setFormMappingState,
  encounterTypes,
  programs,
  subjectTypes,
  postUpdatedFormMappings,
  disableCheckbox
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const getPropertyFromRowData = (row, rowUUIDProperty, entityArray) =>
    get(find(entityArray, st => st.uuid === row[rowUUIDProperty]), "name");
  const columns = [
    { title: "Form Name", field: "formName" },
    {
      title: "Subject Type",
      render: rowData => getPropertyFromRowData(rowData, "subjectTypeUUID", subjectTypes)
    },
    {
      title: "Program",
      render: rowData => getPropertyFromRowData(rowData, "programUUID", programs)
    },
    {
      title: "EncounterType",
      render: rowData => getPropertyFromRowData(rowData, "encounterTypeUUID", encounterTypes)
    }
  ];

  function onRowClick(rowData, checked) {
    const updatedFormMapping = rowData;
    updatedFormMapping.enableApproval = checked;
    const updatedFormMappingState = map(formMappingState, fm =>
      fm.id === updatedFormMapping.id ? updatedFormMapping : fm
    );
    postUpdatedFormMappings([updatedFormMapping], () =>
      setFormMappingState(updatedFormMappingState)
    );
  }

  return (
    <ExpansionPanel square expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <CustomisedExpansionPanelSummary>
        <Typography>Form wise approval settings</Typography>
      </CustomisedExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div style={{ width: "100%" }}>
          <MaterialTable
            columns={columns}
            data={formMappingState}
            actions={[{ onClick: (checked, rowData) => onRowClick(rowData, checked) }]}
            components={{
              Action: props => (
                <Checkbox
                  disabled={disableCheckbox}
                  color="primary"
                  checked={props.data.enableApproval}
                  onChange={event => props.action.onClick(event.target.checked, props.data)}
                />
              ),
              Toolbar: () => <div />
            }}
            options={{ paging: false }}
            localization={{ header: { actions: "Enable Approval" } }}
          />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
