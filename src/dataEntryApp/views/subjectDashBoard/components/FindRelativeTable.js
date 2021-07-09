import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import { first } from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import TableHead from "@material-ui/core/TableHead";
import Radio from "@material-ui/core/Radio";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  tableContainer: {
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

const FindRelativeTable = ({ subjectData, errormsg }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = React.useState("1");

  const handleChange = (event, uuid, row) => {
    setSelectedValue(event.target.value);
    sessionStorage.setItem("selectedRelative", JSON.stringify(row));
  };

  // const isSelected = uuid => selected.indexOf(uuid) !== -1;

  return (
    <div className={classes.root}>
      <Typography variant="subtitle2" gutterBottom>
        {subjectData ? (subjectData.length === 0 ? "No" : subjectData.length) : ""} Results found
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        {errormsg}
      </Typography>

      {subjectData && subjectData.length !== 0 ? (
        <Table
          className={classes.tableContainer}
          aria-labelledby="tableTitle"
          // size={dense ? "small" : "medium"}
          aria-label="enhanced table"
        >
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
                  <TableRow>
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
        </Table>
      ) : (
        ""
      )}
    </div>
  );
};
const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectTypes: first(state.dataEntry.metadata.operationalModules.subjectTypes)
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(FindRelativeTable)
);
