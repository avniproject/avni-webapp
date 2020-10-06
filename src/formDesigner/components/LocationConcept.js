import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { AvniSelect } from "../../common/components/AvniSelect";

const useStyles = makeStyles(theme => ({
  width: 195,
  marginRight: 10,
  select: {
    width: "200px",
    height: 40,
    marginTop: 24
  }
}));

export const LocationConcept = props => {
  const classes = useStyles();

  if (props.keyValues.length === 0) {
    //Initialize if keyvalues don't exist
    props.onKeyValueChange(
      {
        key: "isWithinCatchment",
        value: false
      },
      0
    );
    props.onKeyValueChange(
      {
        key: "lowestAddressLevelTypeUUID",
        value: props.options[props.options.length - 1].key
      },
      1
    );
    props.onKeyValueChange(
      {
        key: "highestAddressLevelTypeUUID",
        value: props.options[0].key
      },
      2
    );
  }

  return (
    <>
      <Grid container justify="flex-start">
        <Grid item sm={12}>
          <FormControlLabel
            control={
              <AvniSwitch
                onChange={event =>
                  props.onKeyValueChange(
                    {
                      key: "isWithinCatchment",
                      value: event.target.checked
                    },
                    0
                  )
                }
                checked={props.isWithinCatchment}
                toolTipKey="APP_DESIGNER_CONCEPT_LOCATION_WITHIN_CATCHMENT"
              />
            }
            label="Location is within Catchment"
          />
        </Grid>
        <Grid item sm={12}>
          <AvniSelect
            style={{ width: "400px", height: 40, marginTop: 24, marginBottom: 24 }}
            onChange={event =>
              props.onKeyValueChange(
                {
                  key: "lowestAddressLevelTypeUUID",
                  value: event.target.value
                },
                1
              )
            }
            options={props.options}
            value={props.lowestAddressLevelType}
            label="Lowest Location Level"
            toolTipKey="APP_DESIGNER_CONCEPT_LOCATION_LEVEL"
          />
        </Grid>
        <Grid item sm={12}>
          <AvniSelect
            style={{ width: "400px", height: 40, marginTop: 24, marginBottom: 24 }}
            onChange={event =>
              props.onKeyValueChange(
                {
                  key: "highestAddressLevelTypeUUID",
                  value: event.target.value
                },
                2
              )
            }
            options={props.options}
            value={props.highestAddressLevelType}
            label="Highest Location Level"
            toolTipKey="APP_DESIGNER_CONCEPT_LOCATION_LEVEL"
          />
        </Grid>
      </Grid>
    </>
  );
};
