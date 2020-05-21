import React from "react";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { DeleteData } from "./components/DeleteData";

export const OrganisationDetail = ({ organisation: { name } }) => {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <DocumentationContainer filename={"OrganisationDetail.md"}>
        <Title title={"Organisation Details"} />
        <Grid container direction={"column"} spacing={5}>
          <Grid item container spacing={3}>
            <Grid item>Organisation Name : {name}</Grid>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
              Delete all data
            </Button>
          </Grid>
        </Grid>
        <DeleteData openModal={openModal} setOpenModal={setOpenModal} />
      </DocumentationContainer>
    </Box>
  );
};
