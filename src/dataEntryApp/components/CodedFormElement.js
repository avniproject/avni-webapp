import React from "react";
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  FormHelperText
} from "@material-ui/core";
import { xor, first, filter } from "lodash";
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import Box from "@material-ui/core/Box";
import { useTranslation } from "react-i18next";
import _ from "lodash";

export const CodedFormElement = ({
  groupName,
  items,
  isChecked,
  onChange,
  multiSelect,
  mandatory,
  validationResults,
  uuid,
  ...props
}) => {
  let genwidth = "";
  if (groupName === "Gender") {
    genwidth = "10%";
  } else {
    genwidth = "20%";
  }
  const { t } = useTranslation();
  const foundIndex = _.findIndex(validationResults, element => element.uuid === uuid);
  const validationResult =
    validationResults && validationResults[foundIndex]
      ? validationResults[foundIndex].validationResult
      : null;
  return (
    <FormControl
      component="fieldset"
      {...props}
      style={{ width: "80%" }}
      required={mandatory}
      error={validationResult && !validationResult.success}
      // error={!_.isEmpty(errorMsg)}
    >
      <FormLabel component="legend">{t(groupName)}</FormLabel>
      <FormGroup>
        <Box display="flex" flexWrap="wrap" alignContent="flex-start">
          {items.map(item => (
            <Box width={genwidth}>
              <FormControlLabel
                key={item.uuid}
                control={
                  multiSelect ? (
                    <Checkbox
                      checked={isChecked(item)}
                      onChange={() => onChange(item)}
                      value={item.uuid}
                    />
                  ) : (
                    <Radio
                      checked={isChecked(item)}
                      onChange={() => onChange(first(xor([item], filter(items, isChecked))))}
                      value={item.uuid}
                    />
                  )
                }
                label={t(item.name)}
              />{" "}
            </Box>
          ))}
        </Box>
      </FormGroup>
      {/* <FormHelperText>{errorMsg}</FormHelperText> */}
      <FormHelperText>{validationResult && validationResult.messageKey}</FormHelperText>
    </FormControl>
  );
};
