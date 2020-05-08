import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { map } from "lodash";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import FormHelperText from "@material-ui/core/FormHelperText";
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

export default function KeyValues({
  keyValues,
  onKeyValueChange,
  onAddNewKeyValue,
  onDeleteKeyValue,
  error
}) {
  const classes = useStyles();
  return (
    <Box mt={5}>
      {map(keyValues, ({ key, value }, index) => (
        <Grid key={index} container direction="row" alignItems="center">
          <form className={classes.root} noValidate autoComplete="off">
            <TextField
              id="outlined-basic"
              label="Key"
              variant="outlined"
              value={key}
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
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Grid>
      ))}
      {error && <FormHelperText error>Key-Value can't be blank</FormHelperText>}
      <Grid container>
        <Button
          type="button"
          className={useStyles.button}
          color="primary"
          onClick={onAddNewKeyValue}
        >
          Add New Key-Value
        </Button>
        <Grid item xs={4}>
          <ToolTip toolTipKey={"APP_DESIGNER_CONCEPT_KEY_VALUE"} />
        </Grid>
      </Grid>
    </Box>
  );
}
