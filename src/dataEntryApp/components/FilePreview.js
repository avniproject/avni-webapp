import React from "react";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { size, get, isNil } from "lodash";
import { Box, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: "#474747"
  },
  icon: {
    fontSize: 40,
    marginRight: 15,
    color: "#FFF"
  }
}));

// temp fix to ensure there is no crash. don't merge this.
function getFileName(obsValue) {
  if (isNil(obsValue)) {
    return "";
  } else if (Array.isArray(obsValue)) {
    return obsValue.length > 0 ? obsValue[0] : "";
  }
  return obsValue;
}

export const FilePreview = ({ url, obsValue }) => {
  const classes = useStyles();
  const getDisplayFileName = () => {
    const fileName = getFileName(obsValue);
    const originalName = get(fileName.trim().match(/[0-9A-Fa-f-]{36}\.\w+$/), 0);
    const nameLength = size(originalName);
    const MAX_CHAR_ALLOWED = 12;
    if (nameLength > MAX_CHAR_ALLOWED + 3) {
      return `${originalName.substring(0, MAX_CHAR_ALLOWED / 2 - 1)}...${originalName.substring(
        nameLength - MAX_CHAR_ALLOWED / 2
      )}`;
    }
    return originalName;
  };
  return (
    <Box
      display={"flex"}
      flexDirection={"row"}
      alignItems={"center"}
      px={4}
      py={1}
      className={classes.container}
      onClick={() => window.open(url, "_blank")}
      style={{ cursor: "pointer" }}
    >
      <InsertDriveFileIcon className={classes.icon} />
      <div>
        <Typography variant="body1" style={{ color: "#FFF" }}>
          {getDisplayFileName()}
        </Typography>
      </div>
    </Box>
  );
};
