import React from "react";
import Grid from "@material-ui/core/Grid";
import { AvniSelect } from "../../common/components/AvniSelect";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import http from "../../common/utils/httpClient";

export const SubjectConcept = props => {
  const [subjectType, setSubjectType] = React.useState("");
  const [subjectTypeOptions, setSubjectTypeOptions] = React.useState([]);

  React.useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        setSubjectTypeOptions(response.data.subjectTypes);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  React.useEffect(() => {
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
      <Grid container justify="flex-start">
        <Grid item xs={12} sm={12}>
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
