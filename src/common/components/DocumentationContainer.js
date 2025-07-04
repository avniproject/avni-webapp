import { PlatformDocumentation } from "./PlatformDocumentation";
import { Grid } from "@mui/material";

export const DocumentationContainer = ({ filename, ...props }) => {
  return (
    <Grid container style={{ backgroundColor: "#fff" }}>
      <Grid size={9}>{props.children}</Grid>
      {filename && (
        <Grid size={3}>
          <PlatformDocumentation fileName={filename} />
        </Grid>
      )}
    </Grid>
  );
};
