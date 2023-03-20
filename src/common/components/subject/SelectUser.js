import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Radio from "@material-ui/core/Radio";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: 20
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  tableContainer: {
    marginTop: 20,
    minWidth: 750
  }
}));

const SelectUser = function({ users, errorMessage, onSelectedUser }) {
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = React.useState(null);

  const handleChange = (event, uuid, row) => {
    setSelectedValue(event.target.value);
    onSelectedUser(row);
  };

  return (
    <Box className={classes.root}>
      {users && (
        <Typography variant="h5" gutterBottom>
          {users.length === 0 ? "No users found" : `${users.length} - users found`}
        </Typography>
      )}
      <Typography variant="subtitle2" gutterBottom>
        {errorMessage}
      </Typography>

      {users && users.length !== 0 ? (
        <Table
          className={classes.tableContainer}
          aria-labelledby="tableTitle"
          aria-label="enhanced table"
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left">{"Name"}</TableCell>
              <TableCell align="left">{"Email"}</TableCell>
              <TableCell align="left">{"Phone Number"}</TableCell>
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
        </Table>
      ) : (
        ""
      )}
    </Box>
  );
};

export default SelectUser;
