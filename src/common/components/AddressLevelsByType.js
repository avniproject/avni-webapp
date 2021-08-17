import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import _ from "lodash";
import Select from "react-select";
import httpClient from "../utils/httpClient";
import { Grid } from "@material-ui/core";
import { locationNameRenderer } from "../../dataEntryApp/utils/LocationUtil";

const AddressLevelsByType = ({ addressLevelsIds, setAddressLevelsIds, setError }) => {
  const [data, setData] = React.useState([]);
  const [selectedAddresses, setSelectedAddresses] = React.useState([]);
  const [openMenu, setOpenMenu] = React.useState(false);

  React.useEffect(() => {
    httpClient.get("/locations/web/getAll").then(res => {
      const data = res.data;
      setData(data);
    });
  }, []);

  const createListOptions = () =>
    _.map(data, location => ({
      label: location.name,
      value: location.id,
      optionLabel: locationNameRenderer(location)
    }));

  const ids = _.map(selectedAddresses, ({ value }) => value);
  if (!_.isEqual(ids, addressLevelsIds)) {
    setAddressLevelsIds(ids);
    //Spring batch JobParameter string max length is 250
    if (ids.join(",").length > 250) {
      setError("You cannot pass these many addresses to the job.");
    } else {
      setError(undefined);
    }
  }

  const onInputChange = value => {
    let menuIsOpen = false;
    if (value) {
      menuIsOpen = true;
    }
    setOpenMenu(menuIsOpen);
  };

  return (
    !_.isEmpty(data) && (
      <Grid item xs={6} style={{ marginBottom: "10px" }}>
        <FormControl fullWidth component="fieldset">
          <FormLabel component="legend">{"Address (Leave blank to consider all)"}</FormLabel>
          <Select
            isMulti
            isSearchable
            placeholder={`Start typing and select`}
            value={selectedAddresses}
            options={createListOptions()}
            onChange={event => setSelectedAddresses(event)}
            onInputChange={onInputChange}
            menuIsOpen={openMenu}
            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
            formatOptionLabel={({ optionLabel }) => <div>{optionLabel}</div>}
          />
        </FormControl>
      </Grid>
    )
  );
};

export default AddressLevelsByType;
