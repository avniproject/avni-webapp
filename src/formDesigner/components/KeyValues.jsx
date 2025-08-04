import { styled } from "@mui/material/styles";
import {
  TextField,
  Box,
  Button,
  IconButton,
  Grid,
  FormHelperText
} from "@mui/material";
import { map } from "lodash";
import { Delete } from "@mui/icons-material";
import { ToolTip } from "../../common/components/ToolTip";

const StyledForm = styled("form")(({ theme }) => ({
  "& > *": {
    marginRight: theme.spacing(1),
    width: 150
  }
}));

const StyledButton = styled(Button)({
  height: "35px",
  width: "17%",
  justifyContent: "start",
  marginTop: 5
});

const StyledTextField = styled(TextField)({
  marginRight: 10,
  "& .MuiInputBase-input": {
    height: 20
  }
});

const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5)
}));

const StyledIconButton = styled(IconButton)({
  marginTop: 5
});

export default function KeyValues({
  keyValues,
  onKeyValueChange,
  onAddNewKeyValue,
  onDeleteKeyValue,
  error,
  readOnlyKeys = []
}) {
  return (
    <StyledBox>
      {map(keyValues, (item, index) => (
        <Grid
          key={index}
          container
          direction="row"
          sx={{ alignItems: "center" }}
        >
          <StyledForm
            noValidate
            autoComplete="off"
            sx={{ flexDirection: "row" }}
          >
            <StyledTextField
              id="outlined-basic"
              label="Key"
              variant="outlined"
              disabled={readOnlyKeys.includes(item && item.key)}
              value={(item && item.key) || ""}
              onChange={event =>
                onKeyValueChange(
                  { key: event.target.value, value: item && item.value },
                  index
                )
              }
            />
            <StyledTextField
              id="outlined-basic"
              label="Value"
              variant="outlined"
              disabled={readOnlyKeys.includes(item && item.key)}
              value={(item && item.value) || ""}
              onChange={event =>
                onKeyValueChange(
                  { key: item && item.key, value: event.target.value },
                  index
                )
              }
            />
            <StyledIconButton
              aria-label="delete"
              onClick={() => onDeleteKeyValue(index)}
              disabled={readOnlyKeys.includes(item && item.key)}
            >
              <Delete fontSize="inherit" />
            </StyledIconButton>
          </StyledForm>
        </Grid>
      ))}
      {error && <FormHelperText error>Key-Value can't be blank</FormHelperText>}
      <Grid container>
        <StyledButton type="button" color="primary" onClick={onAddNewKeyValue}>
          Add New Key-Value
        </StyledButton>
        <Grid size={4}>
          <ToolTip toolTipKey="APP_DESIGNER_CONCEPT_KEY_VALUE" />
        </Grid>
      </Grid>
    </StyledBox>
  );
}
