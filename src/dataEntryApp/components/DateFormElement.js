import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isEmpty, find } from "lodash";
import { useTranslation } from "react-i18next";

const SimpleDateFormElement = ({
  formElement: fe,
  type,
  value,
  update,
  validationResults,
  uuid
}) => {
  const [date, setDate] = React.useState(value ? value.toISOString() : "");
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  /*TODO:
   * DateFormElement cannot be auto-calculated as of now.
   * Because the two way binding is not implemented.
   *
   * React.useEffect( fun {
   *   if current element not focused {
   *     setDate(value ? value.toISOString() : "")
   *   }
   * }, [value]);
   *
   * */

  return (
    <Fragment>
      <TextField
        label={fe.display || fe.name}
        type={type}
        required={fe.mandatory}
        name={fe.name}
        fullWidth
        InputLabelProps={{
          shrink: true
        }}
        value={date}
        helperText={validationResult && t(validationResult.messageKey)}
        error={validationResult && !validationResult.success}
        onChange={e => {
          const value = e.target.value;
          isEmpty(value) ? setDate("") : setDate(value);
          isEmpty(value) ? update() : update(value);
        }}
      />
    </Fragment>
  );
};

export const DateFormElement = props => <SimpleDateFormElement type="date" {...props} />;
export const DateTimeFormElement = props => (
  <SimpleDateFormElement type="datetime-local" {...props} />
);
