import React from "react";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import { noop, isNil, isEmpty, first } from "lodash";
import { connect } from "react-redux";
import { withRouter, useHistory } from "react-router-dom";
import TableHead from "@material-ui/core/TableHead";
import Radio from "@material-ui/core/Radio";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import { useTranslation } from "react-i18next";
import { Row } from "reactstrap";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  }
}));

const FindRelativeTable = ({ subjectData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const [value, setValue] = React.useState("");
  // let selectedRelatives = [];
  const handleClick = (event, uuid, row) => {
    const selectedIndex = selected.indexOf(uuid);
    let newSelected = [];
    let sub = row;
    sessionStorage.setItem("selectedRelative", JSON.stringify(sub));
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uuid);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = uuid => selected.indexOf(uuid) !== -1;

  return (
    <div className={classes.root}>
      <Typography variant="subtitle2" gutterBottom>
        {subjectData && subjectData.content ? subjectData.content.length : ""} Result selected
      </Typography>
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        // size={dense ? "small" : "medium"}
        aria-label="enhanced table"
      >
        {/* <EnhancedTableHead
            classes={classes}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          /> */}

        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Age</TableCell>
            <TableCell align="left">Village</TableCell>
            <TableCell align="left">Subject type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjectData &&
            subjectData.content.map((row, index) => {
              const isItemSelected = isSelected(row.uuid);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  onClick={event => handleClick(event, row.uuid, row)}
                  role="radio"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.uuid}
                  selected={isItemSelected}
                >
                  <TableCell padding="radio">
                    <Radio checked={isItemSelected} inputProps={{ "aria-labelledby": labelId }} />
                  </TableCell>
                  <TableCell align="left" scope="row" id={labelId}>
                    {row.fullName}
                  </TableCell>
                  <TableCell align="left">{row.dateOfBirth}</TableCell>
                  <TableCell align="left">{row.addressLevel.title}</TableCell>
                  <TableCell align="left">{row.subjectType.name}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};
const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectTypes: first(state.dataEntry.metadata.operationalModules.subjectTypes)
});

const mapDispatchToProps = {
  // search: searchSubjects
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FindRelativeTable)
);
