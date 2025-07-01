import React, { useMemo } from "react";
import { GridLegacy as Grid, MenuItem, FormHelperText } from "@mui/material";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { AvniSelect } from "../../common/components/AvniSelect";
import _ from "lodash";
import http from "../../common/utils/httpClient";

export const LocationConcept = props => {
  const [addressLevelTypes, setAddressLevelTypes] = React.useState([]);
  const [addressLevelTypeHierarchy, setAddressLevelTypeHierarchy] = React.useState(new Map());
  const [isWithinCatchment, setWithinCatchment] = React.useState(true);
  const [lowestAddressLevelTypes, setLowestAddressLevelTypes] = React.useState([]);
  const [highestAddressLevelTypeOptions, setHighestAddressLevelTypeOptions] = React.useState([]);
  const [highestAddressLevelType, setHighestAddressLevelType] = React.useState("");

  React.useEffect(() => {
    http.get("/addressLevelType?page=0&size=10&sort=level%2CDESC").then(response => {
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
    });
  }, []);

  const keyValuesArr = useMemo(() => [...props.keyValues], [...props.keyValues]);

  React.useEffect(() => {
    if (props.isCreatePage || props.keyValues.length === 0) {
      updateIsWithinCatchment();
    } else {
      const withinCatchment =
        props.keyValues.find(keyValue => keyValue.key === "isWithinCatchment") !== undefined
          ? props.keyValues.find(keyValue => keyValue.key === "isWithinCatchment").value
          : true;
      setWithinCatchment(withinCatchment === true || withinCatchment === "true");

      const lowest =
        props.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs") !== undefined
          ? props.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs").value
          : undefined;
      setLowestAddressLevelTypes(lowest !== undefined ? lowest : []);

      const highest =
        props.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID") !== undefined
          ? props.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID").value
          : undefined;
      setHighestAddressLevelType(highest !== undefined ? highest : "");
    }
  }, [keyValuesArr]);

  React.useEffect(() => {
    setAddressLevelTypeHierarchy(generateAddressLevelTypeHierarchy());
    setHighestAddressLevelTypeOptions(addressLevelTypes);
  }, [addressLevelTypes]);

  React.useEffect(() => {
    refreshHighestAddressLevelTypeOptions();
  }, [lowestAddressLevelTypes, addressLevelTypeHierarchy]);

  React.useEffect(() => {
    _.isEmpty(lowestAddressLevelTypes) && defaultLowestAddressLevelIfSingleHierarchy();
  }, [addressLevelTypeHierarchy]);

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

  function defaultLowestAddressLevelIfSingleHierarchy() {
    if (addressLevelTypeHierarchy === undefined || addressLevelTypeHierarchy.size === 0) return;
    let isSingleHierarchy = true;

    const addressLevelTypeEntries = addressLevelTypeHierarchy.entries();

    let i = 0;
    let uuid = "";
    while (i < addressLevelTypeHierarchy.size) {
      let entry = addressLevelTypeEntries.next();
      if (entry !== undefined && entry.value !== undefined) {
        uuid = entry.value[0];
        //this works because the hierarchy is sorted
        isSingleHierarchy = i === entry.value[1].length;
        i++;
      }
    }
    if (isSingleHierarchy) {
      updateLowestAddressLevelTypes(undefined, [uuid]);
    }
  }

  const updateIsWithinCatchment = event => {
    const updateValue = event === undefined ? true : event.target.checked;
    setWithinCatchment(updateValue);
    props.inlineConcept
      ? props.updateConceptKeyValues(props.groupIndex, "isWithinCatchment", updateValue, props.index)
      : props.updateConceptKeyValues(
          {
            key: "isWithinCatchment",
            value: updateValue
          },
          0
        );
  };

  const updateLowestAddressLevelTypes = (event, uuids) => {
    const lowestAddressLevelTypeUUIDs = event !== undefined ? event.target.value : uuids;
    setLowestAddressLevelTypes(lowestAddressLevelTypeUUIDs);
    props.inlineConcept
      ? props.updateConceptKeyValues(props.groupIndex, "lowestAddressLevelTypeUUIDs", lowestAddressLevelTypeUUIDs, props.index)
      : props.updateConceptKeyValues(
          {
            key: "lowestAddressLevelTypeUUIDs",
            value: lowestAddressLevelTypeUUIDs
          },
          1
        );
  };

  function refreshHighestAddressLevelTypeOptions() {
    if (addressLevelTypeHierarchy.size === 0) return;
    let intersection = Array.from(addressLevelTypeHierarchy.keys());
    lowestAddressLevelTypes.forEach(levelType => {
      intersection = _.intersection(intersection, addressLevelTypeHierarchy.get(levelType));
    });

    const highestOptions = addressLevelTypes.filter(addressLevelType => intersection.includes(addressLevelType.value));
    setHighestAddressLevelTypeOptions(highestOptions);
    props.error["noCommonAncestor"] =
      highestOptions.length === 0 && lowestAddressLevelTypes.length !== 1 && lowestAddressLevelTypes[0].parent !== null;
    if (highestAddressLevelType !== "" && !intersection.includes(highestAddressLevelType)) {
      updateHighestAddressLevelType();
    }
  }

  const updateHighestAddressLevelType = event => {
    const updateValue = event === undefined ? "" : event.target.value;

    setHighestAddressLevelType(updateValue);
    props.inlineConcept
      ? props.updateConceptKeyValues(props.groupIndex, "highestAddressLevelTypeUUID", updateValue, props.index)
      : props.updateConceptKeyValues(
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
      <Grid
        container
        sx={{
          justifyContent: "flex-start"
        }}
      >
        <Grid item={true} xs={12} sm={12}>
          <AvniSwitch
            onChange={updateIsWithinCatchment}
            checked={isWithinCatchment}
            toolTipKey="APP_DESIGNER_CONCEPT_LOCATION_WITHIN_CATCHMENT"
            name="Location is available within user's Catchment"
          />
        </Grid>
        <Grid item={true} xs={12} sm={12}>
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
          {props.error.lowestAddressLevelRequired && <FormHelperText error>*Required</FormHelperText>}
          {props.error.noCommonAncestor && <FormHelperText error>No common higher location between selected lower levels.</FormHelperText>}
        </Grid>
        {lowestAddressLevelTypes.length > 0 && (
          <Grid item={true} xs={12} sm={12}>
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
