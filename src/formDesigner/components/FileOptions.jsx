import Select from "react-select";
import { Fragment } from "react";
import { FileFormat } from "avni-models";
import { FormControl, TextField } from "@mui/material";
import { filter, includes, isNil, toNumber, map } from "lodash";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";

export const FileOptions = ({ keyValues, handleChange, groupIndex, index }) => {
  const fileFormatOptions = FileFormat.names.map((name) => ({
    label: name,
    value: FileFormat.getType(name),
  }));

  const onChange = (event) => {
    const allowedTypes = map(event, ({ value }) => value);
    handleChange(groupIndex, "allowedTypes", allowedTypes, index);
  };

  if (isNil(keyValues.allowedMaxSize)) {
    handleChange(groupIndex, "allowedMaxSize", 1, index);
  }

  return (
    <Fragment>
      <FormControl fullWidth>
        <AvniFormLabel
          label={
            "Allowed file types (All types will be allowed if nothing is chosen)"
          }
          toolTipKey={"APP_DESIGNER_SUPPORTED_FILE_TYPES"}
        />
        <Select
          isMulti
          placeholder={`Select the file types`}
          value={filter(fileFormatOptions, ({ value }) =>
            includes(keyValues.allowedTypes, value),
          )}
          options={fileFormatOptions}
          onChange={onChange}
        />
      </FormControl>
      <FormControl>
        <AvniFormLabel
          label={"Allowed max size in MB"}
          toolTipKey={"APP_DESIGNER_FILE_MAX_SIZE"}
        />
        <TextField
          type="number"
          value={keyValues.allowedMaxSize}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, "");
            handleChange(groupIndex, "allowedMaxSize", value, index);
          }}
          onBlur={() =>
            handleChange(
              groupIndex,
              "allowedMaxSize",
              toNumber(keyValues.allowedMaxSize),
              index,
            )
          }
          slotProps={{
            htmlInput: {
              onWheel: (e) => e.target.blur(),
            },
          }}
        />
      </FormControl>
    </Fragment>
  );
};
