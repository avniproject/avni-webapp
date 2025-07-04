import { useState, useEffect } from "react";
import { Grid, MenuItem, FormHelperText } from "@mui/material";
import { AvniSelect } from "../../common/components/AvniSelect";
import { get } from "lodash";

export const SubjectConcept = props => {
  const subjectTypeOptions = get(props.operationalModules, "subjectTypes", []);
  const [subjectType, setSubjectType] = useState("");

  useEffect(() => {
    if (props.isCreatePage || props.keyValues === undefined || props.keyValues.length === 0) {
    } else {
      const subjectType =
        props.keyValues.find(keyValue => keyValue.key === "subjectTypeUUID") !== undefined
          ? props.keyValues.find(keyValue => keyValue.key === "subjectTypeUUID").value
          : undefined;
      setSubjectType(subjectType !== undefined ? subjectType : "");
    }
  }, [props.keyValues]);

  const updateSubjectType = event => {
    setSubjectType(event.target.value);
    props.inlineConcept
      ? props.updateKeyValues(props.groupIndex, "subjectTypeUUID", event.target.value, props.index)
      : props.updateKeyValues(
          {
            key: "subjectTypeUUID",
            value: event.target.value
          },
          0
        );
  };

  return (
    <>
      <br />
      <Grid
        container
        sx={{
          justifyContent: "flex-start"
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}
        >
          <AvniSelect
            style={{ width: "400px", height: 40, marginTop: 24 }}
            onChange={updateSubjectType}
            options={subjectTypeOptions.map(subjectType => (
              <MenuItem value={subjectType.uuid} key={subjectType.uuid}>
                {subjectType.name}
              </MenuItem>
            ))}
            value={subjectType}
            label="Subject Type"
            toolTipKey="APP_DESIGNER_CONCEPT_SUBJECT_TYPE"
          />
          {props.error.subjectTypeRequired && <FormHelperText error>*Required</FormHelperText>}
        </Grid>
      </Grid>
    </>
  );
};
