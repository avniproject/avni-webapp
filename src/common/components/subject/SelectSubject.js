import { useState } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Radio } from "@mui/material";
import _ from "lodash";

const StyledContainer = styled("div")({
  width: "100%"
});

const StyledTable = styled(Table)({
  minWidth: 750
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  variant: "h5",
  marginBottom: theme.spacing(1)
}));

const StyledErrorTypography = styled(Typography)(({ theme }) => ({
  variant: "subtitle2",
  marginBottom: theme.spacing(1)
}));

const SelectSubject = function({ subjectData, errormsg, onSelectedItem, t = _.identity }) {
  const [selectedValue, setSelectedValue] = useState("1");

  const handleChange = (event, uuid, row) => {
    setSelectedValue(event.target.value);
    onSelectedItem(row);
  };

  return (
    <StyledContainer>
      <StyledTypography>{subjectData ? (subjectData.length === 0 ? "No" : subjectData.length) : ""} Results found</StyledTypography>
      <StyledErrorTypography>{errormsg}</StyledErrorTypography>
      {subjectData && subjectData.length !== 0 ? (
        <StyledTable aria-labelledby="tableTitle" aria-label="enhanced table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left">{t("name")}</TableCell>
              <TableCell align="left">{t("dob")}</TableCell>
              <TableCell align="left">{t("gender")}</TableCell>
              <TableCell align="left">{t("address")}</TableCell>
              <TableCell align="left">{t("subjectType")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjectData &&
              subjectData.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow key={labelId}>
                    <TableCell padding="checkbox">
                      <Radio
                        checked={selectedValue === row.uuid}
                        onChange={event => handleChange(event, row.uuid, row)}
                        value={row.uuid}
                        name="radio-button-demo"
                        inputProps={{ "aria-label": "A" }}
                      />
                    </TableCell>
                    <TableCell align="left" scope="row" id={labelId}>
                      {t(row.fullName)}
                    </TableCell>
                    <TableCell align="left">{row.dateOfBirth}</TableCell>
                    <TableCell align="left">{row.gender}</TableCell>
                    <TableCell align="left">{t(row.addressLevel)}</TableCell>
                    <TableCell align="left">{t(row.subjectTypeName)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </StyledTable>
      ) : (
        ""
      )}
    </StyledContainer>
  );
};

export default SelectSubject;
