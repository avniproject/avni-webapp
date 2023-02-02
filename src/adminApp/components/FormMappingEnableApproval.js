import React from "react";
import { find, get, map } from "lodash";
import Checkbox from "@material-ui/core/Checkbox";
import MaterialTable from "material-table";
import Typography from "@material-ui/core/Typography";
import {Accordion, AccordionDetails} from "@material-ui/core";
import { CustomisedAccordionSummary } from "./CustomisedExpansionPanelSummary";
import http from "common/utils/httpClient";

export const FormMappingEnableApproval = ({
  formMappingState,
  setFormMappingState,
  encounterTypes,
  programs,
  subjectTypes,
  disableCheckbox
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const postUpdatedFormMappings = (payload, onSuccessCB) => {
    http
      .post("/formMappings", payload)
      .then(res => {
        if (res.status === 200 || res.status === 201) {
          onSuccessCB();
        }
      })
      .catch(error => console.error(error));
  };

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
    <Accordion square expanded={expanded} onChange={() => setExpanded((expanded) => !expanded)}>
      <CustomisedAccordionSummary>
        <Typography>Form wise approval settings</Typography>
      </CustomisedAccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
  );
};
