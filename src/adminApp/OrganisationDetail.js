import React, { useEffect } from "react";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { makeStyles } from "@mui/styles";
import { Box, Grid, Button, Snackbar, SnackbarContent, Typography } from "@mui/material";
import { Title } from "react-admin";
import { DeleteData } from "./components/DeleteData";
import { OrgSettings } from "./components/OrgSettings";
import OrganisationCategory from "./domain/OrganisationCategory";
import OrganisationService from "../common/service/OrganisationService";
import _ from "lodash";

const useStyles = makeStyles(theme => ({
  deleteButton: {
    backgroundColor: "red"
  }
}));

function isProduction(organisation) {
  return organisation.category === OrganisationCategory.Production;
}

export const OrganisationDetail = ({
  organisation: { name, id },
  hasEditPrivilege,
  hasOrgAdminConfigDeletionPrivilege,
  hasOrgMetadataDeletionPrivilege
}) => {
  const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [dataDeletedIndicator, setDataDeletedIndicator] = React.useState(false);
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
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <DocumentationContainer filename={"OrganisationDetail.md"}>
        <Title title={"Organisation Details"} />
        <Grid container direction={"row"} spacing={1}>
          <Grid item container spacing={3}>
            <Grid item>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Organisation Name : {name}
              </Typography>
            </Grid>
            {hasEditPrivilege && !_.isNil(organisation) && (
              <Grid item>
                <Button className={classes.deleteButton} variant="contained" color="secondary" onClick={() => onDeleteClick()}>
                  Delete all data
                </Button>
              </Grid>
            )}
          </Grid>
          <OrgSettings hasEditPrivilege={hasEditPrivilege} dataDeletedIndicator={dataDeletedIndicator} />
        </Grid>
        {hasEditPrivilege && (
          <DeleteData
            openModal={openModal}
            setOpenModal={setOpenModal}
            orgName={name}
            hasOrgMetadataDeletionPrivilege={hasOrgMetadataDeletionPrivilege}
            hasOrgAdminConfigDeletionPrivilege={hasOrgAdminConfigDeletionPrivilege}
            setDataDeletedIndicator={setDataDeletedIndicator}
          />
        )}
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
