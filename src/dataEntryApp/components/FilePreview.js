import { styled } from "@mui/material/styles";
import { InsertDriveFile } from "@mui/icons-material";
import { size, get, isNil } from "lodash";
import { Box, Typography } from "@mui/material";

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#474747",
  cursor: "pointer",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing(1, 4)
}));

const StyledIcon = styled(InsertDriveFile)(({ theme }) => ({
  fontSize: 40,
  marginRight: theme.spacing(1.875), // 15px
  color: "#FFF"
}));

const StyledTypography = styled(Typography)({
  color: "#FFF"
});

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
  const getDisplayFileName = () => {
    const fileName = getFileName(obsValue);
    const originalName = get(fileName.trim().match(/[0-9A-Fa-f-]{36}\.\w+$/), 0);
    const nameLength = size(originalName);
    const MAX_CHAR_ALLOWED = 12;
    if (nameLength > MAX_CHAR_ALLOWED + 3) {
      return `${originalName.substring(0, MAX_CHAR_ALLOWED / 2 - 1)}...${originalName.substring(nameLength - MAX_CHAR_ALLOWED / 2)}`;
    }
    return originalName;
  };

  return (
    <StyledBox onClick={() => window.open(url, "_blank")}>
      <StyledIcon />
      <StyledTypography variant="body1">{getDisplayFileName()}</StyledTypography>
    </StyledBox>
  );
};
