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
import { useTranslation } from "react-i18next";

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

const FindRelativeTable = ({ subjectData, errormsg }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const [errorvalue, setErrorValue] = React.useState(errormsg);
  const [selectedValue, setSelectedValue] = React.useState("1");

  const handleChange = (event, uuid, row) => {
    setSelectedValue(event.target.value);
    let sub = row;
    sessionStorage.setItem("selectedRelative", JSON.stringify(sub));
  };

  // const isSelected = uuid => selected.indexOf(uuid) !== -1;

  return (
    <div className={classes.root}>
      <Typography variant="subtitle2" gutterBottom>
        {subjectData && subjectData.content
          ? subjectData.content.length === 0
            ? "No"
            : subjectData.content.length
          : ""}{" "}
        Results found
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        {errorvalue}
      </Typography>

      {subjectData && subjectData.content && subjectData.content.length !== 0 ? (
        <Table
          className={classes.table}
          aria-labelledby="tableTitle"
          // size={dense ? "small" : "medium"}
          aria-label="enhanced table"
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left">{t("name")}</TableCell>
              <TableCell align="left">{t("Age")}</TableCell>
              <TableCell align="left">{t("Village")}</TableCell>
              <TableCell align="left">{t("subjectType")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjectData &&
              subjectData.content.map((row, index) => {
                // const isItemSelected = isSelected(row.uuid);
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
                    <TableCell align="left">{t(row.addressLevel.title)}</TableCell>
                    <TableCell align="left">{t(row.subjectType.name)}</TableCell>
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

const mapDispatchToProps = {
  // search: searchSubjects
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FindRelativeTable)
);
