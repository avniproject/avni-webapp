import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { Box, Grid, Button, Snackbar, SnackbarContent, Typography } from "@mui/material";
import { Title } from "react-admin";
import { DeleteData } from "./components/DeleteData";
import { OrgSettings } from "./components/OrgSettings";
import OrganisationCategory from "./domain/OrganisationCategory";
import OrganisationService from "../common/service";
import _ from "lodash";

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper
}));

const StyledButton = styled(Button)({
  backgroundColor: "red"
});

const StyledSnackbarContent = styled(SnackbarContent)({
  backgroundColor: "red"
});

function isProduction(organisation) {
  return organisation.category === OrganisationCategory.Production;
}

export const OrganisationDetail = ({
  organisation: { name, id },
  hasEditPrivilege,
  hasOrgAdminConfigDeletionPrivilege,
  hasOrgMetadataDeletionPrivilege
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [dataDeletedIndicator, setDataDeletedIndicator] = useState(false);
  const [organisation, setOrganisation] = useState(null);
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = useState(false);

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
    <StyledBox>
      <DocumentationContainer filename={"OrganisationDetail.md"}>
        <Title title={"Organisation Details"} />
        <Grid container direction={"row"} spacing={1}>
          <Grid container spacing={3}>
            <Grid>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Organisation Name : {name}
              </Typography>
            </Grid>
            {hasEditPrivilege && !_.isNil(organisation) && (
              <Grid>
                <StyledButton variant="contained" onClick={onDeleteClick}>
                  Delete all data
                </StyledButton>
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
        <StyledSnackbarContent message={<span>Cannot delete Production organisation's data</span>} />
      </Snackbar>
    </StyledBox>
  );
};
