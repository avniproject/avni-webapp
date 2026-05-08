import {
  FormControl,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import { isNil } from "lodash";
import { useTranslation } from "react-i18next";
import Colors from "../Colors";

const containerStyle = { width: "80%", marginBottom: "-20px" };
const badgeStyle = { color: Colors.DefaultDisabled, marginTop: "8px" };

export const SyncReadOnlyMessage = ({
  label,
  mandatory,
  helperKey,
  badgeText,
}) => {
  const { t } = useTranslation();
  return (
    <FormControl
      component="fieldset"
      required={mandatory}
      error={!!helperKey}
      style={containerStyle}
    >
      <FormLabel component="legend">{t(label)}</FormLabel>
      {helperKey && (
        <FormHelperText error>
          {t(helperKey, "No allowed values configured for your user")}
        </FormHelperText>
      )}
      {!isNil(badgeText) && (
        <Typography variant="body1" sx={badgeStyle}>
          {badgeText}
        </Typography>
      )}
    </FormControl>
  );
};
