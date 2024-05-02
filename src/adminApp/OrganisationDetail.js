import React, { useEffect } from "react";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { DeleteData } from "./components/DeleteData";
import { makeStyles, Snackbar, SnackbarContent } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { OrgSettings } from "./components/OrgSettings";
import OrganisationCategory from "./domain/OrganisationCategory";
import OrganisationService from "../common/service/OrganisationService";
import _ from "lodash";
import CurrentUserService from "../common/service/CurrentUserService";

const useStyles = makeStyles(theme => ({
  deleteButton: {
    backgroundColor: "red"
  }
}));

function isProduction(organisation) {
  return organisation.category === OrganisationCategory.Production;
}

export const OrganisationDetail = ({ organisation: { name, id }, hasEditPrivilege }) => {
  const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [organisation, setOrganisation] = React.useState(null);
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = React.useState(false);

  function onDeleteClick() {
    if (isProduction(organisation)) {
      setShowCannotDeleteMessage(true);
      return;
    }
    setOpenModal(true);
  }

  useEffect(() => {
    OrganisationService.getApplicableOrganisation(id).then(x => setOrganisation(x));
  }, []);

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <DocumentationContainer filename={"OrganisationDetail.md"}>
        <Title title={"Organisation Details"} />
        <Grid container direction={"row"} spacing={1}>
          <Grid item container spacing={3}>
            <Grid item>
              <Typography variant="h6" gutterBottom>
                Organisation Name : {name}
              </Typography>
            </Grid>
            {!CurrentUserService.isOrganisationImpersonated() && hasEditPrivilege && !_.isNil(organisation) && (
              <Grid item>
                <Button className={classes.deleteButton} variant="contained" color="secondary" onClick={() => onDeleteClick()}>
                  Delete all data
                </Button>
              </Grid>
            )}
          </Grid>

          <OrgSettings hasEditPrivilege={hasEditPrivilege} />
        </Grid>

        {hasEditPrivilege && <DeleteData openModal={openModal} setOpenModal={setOpenModal} orgName={name} />}
      </DocumentationContainer>

      <Snackbar open={showCannotDeleteMessage} autoHideDuration={5000} onClose={() => setShowCannotDeleteMessage(false)}>
        <SnackbarContent
          style={{
            backgroundColor: "red"
          }}
          message={<span>Cannot delete Production organisation's data</span>}
        />
      </Snackbar>
    </Box>
  );
};
