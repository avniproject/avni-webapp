import { styled } from "@mui/material/styles";
import {
  TextField,
  Box,
  Button,
  IconButton,
  Grid,
  FormHelperText,
} from "@mui/material";
import { map } from "lodash";
import { Delete } from "@mui/icons-material";
import { ToolTip } from "../../common/components/ToolTip";

const StyledButton = styled(Button)({
  height: "35px",
  width: "17%",
  justifyContent: "start",
  marginTop: 5,
});

const StyledTextField = styled(TextField)({
  marginRight: 10,
  "& .MuiInputBase-input": {
    height: 20,
  },
});

const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5),
}));

const StyledIconButton = styled(IconButton)({
  marginTop: 5,
});

export default function KeyValues({
  keyValues,
  onKeyValueChange,
  onAddNewKeyValue,
  onDeleteKeyValue,
  error,
  errorMessage,
  readOnlyKeys = [],
  keyLabel = "Key",
  valueLabel = "Value",
  addButtonLabel = "Add New Key-Value",
  tooltipKey = "APP_DESIGNER_CONCEPT_KEY_VALUE",
  multilineValue = false,
  valueRows = 3,
}) {
  return (
    <StyledBox>
      {map(keyValues, (item, index) => (
        <Grid key={index} container sx={{ alignItems: "center" }}>
          <Grid sx={{ marginRight: "1rem" }}>
            <StyledTextField
              id="outlined-basic"
              label={keyLabel}
              variant="outlined"
              disabled={readOnlyKeys.includes(item && item.key)}
              value={(item && item.key) || ""}
              onChange={(event) =>
                onKeyValueChange(
                  { key: event.target.value, value: item && item.value },
                  index,
                )
              }
            />
          </Grid>

          <Grid>
            <StyledTextField
              id="outlined-basic"
              label={valueLabel}
              variant="outlined"
              disabled={readOnlyKeys.includes(item && item.key)}
              value={(item && item.value) || ""}
              multiline={multilineValue}
              minRows={multilineValue ? valueRows : undefined}
              sx={multilineValue ? { minWidth: 320 } : undefined}
              onChange={(event) =>
                onKeyValueChange(
                  { key: item && item.key, value: event.target.value },
                  index,
                )
              }
            />
          </Grid>

          <Grid>
            <StyledIconButton
              aria-label="delete"
              onClick={() => onDeleteKeyValue(index)}
              disabled={readOnlyKeys.includes(item && item.key)}
            >
              <Delete fontSize="inherit" />
            </StyledIconButton>
          </Grid>
        </Grid>
      ))}
      {error && (
        <FormHelperText error>
          {errorMessage || "Key-Value can't be blank"}
        </FormHelperText>
      )}
      <Grid container>
        <StyledButton type="button" color="primary" onClick={onAddNewKeyValue}>
          {addButtonLabel}
        </StyledButton>
        <Grid size={4}>
          <ToolTip toolTipKey={tooltipKey} />
        </Grid>
      </Grid>
    </StyledBox>
  );
}
