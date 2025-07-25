import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel
} from "@mui/material";
import { isEmpty } from "lodash";
import Radio from "../../../dataEntryApp/components/Radio";

export const ExportOptions = ({ options, label, selectedOption, onChange }) => {
  return isEmpty(options) ? null : (
    <div>
      <FormControl component="fieldset">
        <FormLabel component="legend">{label}</FormLabel>
        <FormGroup row>
          {options.map(option => (
            <FormControlLabel
              key={option.uuid}
              control={
                <Radio
                  checked={option.uuid === selectedOption.uuid}
                  onChange={() => onChange(option)}
                  value={option.name}
                />
              }
              label={option.name}
            />
          ))}
        </FormGroup>
      </FormControl>
    </div>
  );
};
