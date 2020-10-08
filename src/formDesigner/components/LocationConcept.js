import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { AvniSelect } from "../../common/components/AvniSelect";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import _ from "lodash";
import http from "../../common/utils/httpClient";

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

  const [addressLevelTypes, setAddressLevelTypes] = React.useState([]);
  const [addressLevelTypeHierarchy, setAddressLevelTypeHierarchy] = React.useState(new Map());
  const [isWithinCatchment, setWithinCatchment] = React.useState(false);
  const [lowestAddressLevelTypes, setLowestAddressLevelTypes] = React.useState([]);
  const [highestAddressLevelTypeOptions, setHighestAddressLevelTypeOptions] = React.useState([]);
  const [highestAddressLevelType, setHighestAddressLevelType] = React.useState("");

  React.useEffect(() => {
    http
      .get("/addressLevelType/?page=0&size=10&sort=level%2CDESC")
      .then(response => {
        if (response.status === 200) {
          const addressLevelTypes = response.data.content.map(addressLevelType => ({
            label: addressLevelType.name,
            value: addressLevelType.uuid,
            level: addressLevelType.level,
            parent: addressLevelType.parent
          }));
          setAddressLevelTypes(addressLevelTypes);
        } else {
          console.error(`Response code for /addressLevelType call: ${response.status}`);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  React.useEffect(() => {
    if (props.isCreatePage || props.keyValues.length === 0) {
      updateIsWithinCatchment();
    } else {
      const withinCatchment =
        props.keyValues.find(keyValue => keyValue.key === "isWithinCatchment") !== undefined
          ? props.keyValues.find(keyValue => keyValue.key === "isWithinCatchment").value
          : false;
      setWithinCatchment(withinCatchment === true || withinCatchment === "true");

      const lowest =
        props.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs") !==
        undefined
          ? props.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs").value
          : undefined;
      setLowestAddressLevelTypes(lowest !== undefined ? lowest : []);

      const highest =
        props.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID") !==
        undefined
          ? props.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID").value
          : undefined;
      setHighestAddressLevelType(highest !== undefined ? highest : "");
    }
  }, [props.keyValues]);

  React.useEffect(() => {
    setAddressLevelTypeHierarchy(generateAddressLevelTypeHierarchy());
    setHighestAddressLevelTypeOptions(addressLevelTypes);
  }, [addressLevelTypes]);

  function generateAddressLevelTypeHierarchy() {
    let hierarchy = new Map();

    addressLevelTypes.forEach(addressLevelType => {
      let currentElement = addressLevelType.parent;
      let currentTypeHierarchy = [];
      let i = 0;
      while (currentElement != null) {
        currentTypeHierarchy[i] = currentElement.uuid;
        currentElement = currentElement.parent;
        i++;
      }
      hierarchy.set(addressLevelType.value, currentTypeHierarchy);
    });

    return hierarchy;
  }

  const updateIsWithinCatchment = event => {
    const updateValue = event === undefined ? false : event.target.checked;
    setWithinCatchment(updateValue);
    props.updateKeyValues(
      {
        key: "isWithinCatchment",
        value: updateValue
      },
      0
    );
  };

  const updateLowestAddressLevelTypes = event => {
    const lowestAddressLevelTypeUUIDs = event.target.value;
    setLowestAddressLevelTypes(lowestAddressLevelTypeUUIDs);
    props.updateKeyValues(
      {
        key: "lowestAddressLevelTypeUUIDs",
        value: lowestAddressLevelTypeUUIDs
      },
      1
    );
  };

  React.useEffect(() => {
    refreshHighestAddressLevelTypeOptions();
  }, [lowestAddressLevelTypes, addressLevelTypeHierarchy]);

  function refreshHighestAddressLevelTypeOptions() {
    if (addressLevelTypeHierarchy.size === 0) return;
    let intersection = Array.from(addressLevelTypeHierarchy.keys());
    lowestAddressLevelTypes.forEach(levelType => {
      intersection = _.intersection(intersection, addressLevelTypeHierarchy.get(levelType));
    });

    const highestOptions = addressLevelTypes.filter(addressLevelType =>
      intersection.includes(addressLevelType.value)
    );
    setHighestAddressLevelTypeOptions(highestOptions);
    props.error["noCommonAncestor"] =
      highestOptions.length === 0 &&
      lowestAddressLevelTypes.length !== 1 &&
      lowestAddressLevelTypes[0].parent !== null;
    if (highestAddressLevelType !== "" && !intersection.includes(highestAddressLevelType)) {
      updateHighestAddressLevelType();
    }
  }

  const updateHighestAddressLevelType = event => {
    const updateValue = event === undefined ? "" : event.target.value;

    setHighestAddressLevelType(updateValue);
    props.updateKeyValues(
      {
        key: "highestAddressLevelTypeUUID",
        value: updateValue
      },
      2
    );
  };

  return (
    <>
      <br />
      <Grid container justify="flex-start">
        <Grid item xs={12} sm={12}>
          <AvniSwitch
            onChange={updateIsWithinCatchment}
            checked={isWithinCatchment}
            toolTipKey="APP_DESIGNER_CONCEPT_LOCATION_WITHIN_CATCHMENT"
            name="Location is available within user's Catchment"
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <AvniSelect
            style={{ width: "400px", height: 40, marginTop: 24, marginBottom: 24 }}
            onChange={updateLowestAddressLevelTypes}
            options={addressLevelTypes.map(addressLevelType => (
              <MenuItem value={addressLevelType.value} key={addressLevelType.value}>
                {addressLevelType.label}
              </MenuItem>
            ))}
            value={lowestAddressLevelTypes}
            label="Lowest Location Level(s) *"
            multiple
            toolTipKey="APP_DESIGNER_CONCEPT_LOWEST_LOCATION_LEVEL"
          />
          {props.error.lowestAddressLevelRequired && (
            <FormHelperText error>*Required</FormHelperText>
          )}
          {props.error.noCommonAncestor && (
            <FormHelperText error>
              No common higher location between selected lower levels.
            </FormHelperText>
          )}
        </Grid>
        {lowestAddressLevelTypes.length > 0 && (
          <Grid item xs={12} sm={12}>
            <AvniSelect
              style={{ width: "400px", height: 40, marginTop: 24 }}
              onChange={updateHighestAddressLevelType}
              options={highestAddressLevelTypeOptions.map(addressLevelType => (
                <MenuItem value={addressLevelType.value} key={addressLevelType.value}>
                  {addressLevelType.label}
                </MenuItem>
              ))}
              value={highestAddressLevelType}
              label="Highest Location Level"
              toolTipKey="APP_DESIGNER_CONCEPT_HIGHEST_LOCATION_LEVEL"
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};
