import React from "react";
import { makeStyles } from "@mui/styles";
import { List, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { InternalLink } from "../../../common/components/utils";
import { useTranslation } from "react-i18next";
import SubjectTypeIcon from "../../components/SubjectTypeIcon";
import { sortBy } from "lodash";

import ListItemButton from "@mui/material/ListItemButton";

const useStyle = makeStyles(theme => ({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    color: "blue",
    borderRadius: "3px"
  },
  nested: {
    paddingLeft: theme.spacing(4)
  },
  dividerColor: {
    backgroundColor: "grey"
  },
  FormControlRadio: {
    marginTop: "20px"
  }
}));

function NewMenu({ operationalModules, handleClose }) {
  const classes = useStyle();
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.root}>
        {sortBy(operationalModules.subjectTypes, ({ name }) => t(name)).map((element, index) => {
          return (
            <React.Fragment key={index}>
              <InternalLink key={index} to={`/app/register?type=${element.name}`} style={{ color: "blue" }}>
                <ListItemButton onClick={handleClose}>
                  <ListItemIcon>
                    <SubjectTypeIcon subjectType={element} size={25} />
                  </ListItemIcon>
                  <ListItemText primary={t(element.name)} />
                  <ChevronRight />
                </ListItemButton>
              </InternalLink>
              <Divider className={classes.dividerColor} />
            </React.Fragment>
          );
        })}
      </List>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    operationalModules: state.dataEntry.metadata.operationalModules
  };
};

export default withRouter(connect(mapStateToProps)(NewMenu));
