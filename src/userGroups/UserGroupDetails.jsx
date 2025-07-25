import { useState } from "react";
import { Grid } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { TabView } from "./components/TabbedView";
import Box from "@mui/material/Box";
import { Title } from "react-admin";

const UserGroupDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const groupName = searchParams.get("groupName");
  const [hasAllPrivileges, setHasAllPrivileges] = useState(
    searchParams.get("hasAllPrivileges") === "true"
  );

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title={"User Groups"} />
      <Grid container>
        <TabView
          groupId={id}
          groupName={groupName}
          hasAllPrivileges={hasAllPrivileges}
          setHasAllPrivileges={setHasAllPrivileges}
        />
      </Grid>
    </Box>
  );
};

export default UserGroupDetails;
