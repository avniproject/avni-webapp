import React from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Box, Button, IconButton, Grid, FormHelperText } from "@mui/material";
import { map } from "lodash";
import { Delete } from "@mui/icons-material";
import { ToolTip } from "../../common/components/ToolTip";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      marginRight: theme.spacing(1),
      width: 150
    }
  },
  button: {
    margin: theme.spacing(1),
    height: "35px",
    width: "10%",
    marginTop: 20
  },
  boxHeight: {
    height: 10
  }
}));

export default function KeyValues({ keyValues, onKeyValueChange, onAddNewKeyValue, onDeleteKeyValue, error, readOnlyKeys = [] }) {
  const classes = useStyles();
  return (
    <Box
      sx={{
        mt: 5
      }}
    >
      {map(keyValues, ({ key, value }, index) => (
        <Grid
          key={index}
          container
          direction="row"
          sx={{
            alignItems: "center"
          }}
        >
          <form className={classes.root} noValidate autoComplete="off">
            <TextField
              id="outlined-basic"
              label="Key"
              variant="outlined"
              value={key}
              disabled={readOnlyKeys.includes(key)}
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event =>
                onKeyValueChange(
                  {
                    key: event.target.value,
                    value: value
                  },
                  index
                )
              }
            />
            <TextField
              id="outlined-basic"
              label="Value"
              variant="outlined"
              value={value}
              disabled={readOnlyKeys.includes(key)}
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event =>
                onKeyValueChange(
                  {
                    key: key,
                    value: event.target.value
                  },
                  index
                )
              }
            />
          </form>
          <IconButton
            aria-label="delete"
            onClick={() => onDeleteKeyValue(index)}
            style={{ marginTop: 10 }}
            disabled={readOnlyKeys.includes(key)}
            size="large"
          >
            <Delete fontSize="inherit" />
          </IconButton>
        </Grid>
      ))}
      {error && <FormHelperText error>Key-Value can't be blank</FormHelperText>}
      <Grid container>
        <Button type="button" className={useStyles.button} color="primary" onClick={onAddNewKeyValue}>
          Add New Key-Value
        </Button>
        <Grid size={4}>
          <ToolTip toolTipKey={"APP_DESIGNER_CONCEPT_KEY_VALUE"} />
        </Grid>
      </Grid>
    </Box>
  );
}
