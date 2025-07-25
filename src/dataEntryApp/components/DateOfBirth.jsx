import { useState, useEffect, Fragment } from "react";
import { Box, TextField, Typography } from "@mui/material";
import {
  differenceInYears,
  differenceInMonths,
  subYears,
  subMonths,
  isValid
} from "date-fns";
import _ from "lodash";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";
import { dateFormat } from "dataEntryApp/constants";
import { LineBreak } from "../../common/components/utils";

export const DateOfBirth = ({ dateOfBirth, onChange, dobErrorMsg }) => {
  const { t } = useTranslation();
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const dob =
    (dateOfBirth && isValid(new Date(dateOfBirth)) && new Date(dateOfBirth)) ||
    null;

  useEffect(() => {
    if (dateOfBirth && isValid(new Date(dateOfBirth))) {
      const now = new Date();
      setYears(differenceInYears(now, dateOfBirth));
      setMonths(differenceInMonths(now, dateOfBirth) % 12);
    } else {
      setYears("");
      setMonths("");
    }
  }, [dateOfBirth]);

  const _onYearsChange = value => {
    setYears(value);
    const newDate = subMonths(subYears(new Date(), value), months);
    onChange(newDate);
  };

  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Typography
            variant="body1"
            sx={{ mb: 1 }}
            style={{
              width: "50%",
              marginBottom: 5,
              color: "rgba(0, 0, 0, 0.54)"
            }}
          >
            {t("dateOfBirth")}
            {"*"}
          </Typography>
          <DatePicker
            required
            id="Date-of-Birth"
            autoComplete="off"
            placeholder={dateFormat}
            format={dateFormat}
            name="dateOfBirth"
            value={_.isNil(dateOfBirth) ? null : dateOfBirth}
            onChange={date => onChange(date)}
            slotProps={{
              textField: {
                error: Boolean(!_.isEmpty(dobErrorMsg)),
                helperText: t(dobErrorMsg),
                margin: "normal",
                style: { width: "30%" },
                InputLabelProps: { shrink: true },
                variant: "outlined"
              },
              actionBar: { actions: ["clear"] },
              openPickerButton: {
                "aria-label": "change date",
                color: "primary"
              }
            }}
          />
        </LocalizationProvider>
        <LineBreak num={1} />
        <Typography
          variant="body1"
          sx={{ mb: 1 }}
          style={{ width: "50%", color: "rgba(0, 0, 0, 0.54)" }}
        >
          {t("age")}
        </Typography>
        <TextField
          type={"number"}
          autoComplete="off"
          required
          name="ageYearsPart"
          value={_.isNaN(years) ? "" : years}
          style={{ width: "30%" }}
          error={Boolean(_.isNil(dob) && dobErrorMsg)}
          helperText={
            _.isNil(dob) && dobErrorMsg && t("emptyValidationMessage")
          }
          onChange={e => _onYearsChange(e.target.value)}
        />
      </Box>
    </Fragment>
  );
};
