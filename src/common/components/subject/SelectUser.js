import { useState } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Radio, Box } from "@mui/material";

const StyledContainer = styled(Box)({
  width: "100%",
  marginTop: 20
});

const StyledTable = styled(Table)({
  marginTop: 20,
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

const SelectUser = function({ users, errorMessage, onSelectedUser }) {
  const [selectedValue, setSelectedValue] = useState(null);

  const handleChange = (event, uuid, row) => {
    setSelectedValue(event.target.value);
    onSelectedUser(row);
  };

  return (
    <StyledContainer>
      {users && <StyledTypography>{users.length === 0 ? "No users found" : `${users.length} - users found`}</StyledTypography>}
      <StyledErrorTypography>{errorMessage}</StyledErrorTypography>
      {users && users.length !== 0 ? (
        <StyledTable aria-labelledby="tableTitle" aria-label="enhanced table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Phone Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((row, index) => {
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
                    {row.name}
                  </TableCell>
                  <TableCell align="left">{row.email}</TableCell>
                  <TableCell align="left">{row.phoneNumber}</TableCell>
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

export default SelectUser;
