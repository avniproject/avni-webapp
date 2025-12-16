import { Fragment } from "react";
import { Grid, Checkbox, FormControlLabel } from "@mui/material";
import { AvniFormControl } from "../../common/components/AvniFormControl";
import { FormElement } from "avni-models";
import Types from "../../adminApp/SubjectType/Types";

const SubjectFormElementKeyValues = (props) => {
  const { subjectType } = props;
  return (
    <Fragment>
      <Grid size="auto">
        {Types.isGroup(subjectType.type) && (
          <AvniFormControl
            toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DISPLAY_ALL_GROUP_MEMBERS"}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    props.formElementData.keyValues.displayAllGroupMembers
                  }
                  onChange={(event) =>
                    props.handleGroupElementKeyValueChange(
                      props.groupIndex,
                      FormElement.keys.displayAllGroupMembers,
                      event.target.checked,
                      props.index,
                    )
                  }
                />
              }
              label="Display all group members"
            />
          </AvniFormControl>
        )}
      </Grid>
    </Fragment>
  );
};

export default SubjectFormElementKeyValues;
