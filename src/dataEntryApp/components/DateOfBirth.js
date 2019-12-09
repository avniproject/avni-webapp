import React, { Fragment } from "react";
import { Box, TextField } from "@material-ui/core";
import moment from "moment/moment";
import { LineBreak } from "../../../src/common/components/utils";

export const DateOfBirth = ({ dateOfBirth, onChange }) => {
  const dob = dateOfBirth && dateOfBirth.toISOString().substr(0, 10);
  const [years, setYears] = React.useState("");
  const [months, setMonths] = React.useState("");

  React.useEffect(() => {
    if (dateOfBirth) {
      setYears(moment().diff(dateOfBirth, "years"));
      setMonths(moment().diff(dateOfBirth, "months") % 12);
    } else {
      setYears("");
      setMonths("");
    }
  }, [dateOfBirth]);

  const _onChange = value => {
    const date = new Date(value);
    onChange(moment(date).isValid() ? date : undefined);
  };

  const _onYearsChange = value => {
    setYears(value);
    onChange(
      moment()
        .subtract(value, "years")
        .subtract(months, "months")
        .toDate()
    );
  };

  return (
    <Fragment>
      <Box display="flex" flexDirection="column">
        <TextField
          label="Date of Birth"
          type="date"
          required
          style={{ width: "30%" }}
          name="dateOfBirth"
          value={dob}
          onChange={e => _onChange(e.target.value)}
          InputLabelProps={{
            shrink: true
          }}
        />
        <LineBreak num={1} />
        <TextField
          label={"Age"}
          type={"numeric"}
          name={"ageYearsPart"}
          value={years}
          style={{ width: "30%" }}
          onChange={e => _onYearsChange(e.target.value)}
        />
      </Box>
    </Fragment>
  );
};
