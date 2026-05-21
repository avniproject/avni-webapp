import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import { debounce, deburr, get, map } from "lodash";
import { FormControl, FormLabel } from "@mui/material";
import { httpClient } from "common/utils/httpClient";
import { locationNameRenderer } from "../../dataEntryApp/utils/LocationUtil";

const toOption = (location) => ({
  label: location.title,
  value: location.id,
  optionLabel: locationNameRenderer(location),
  raw: location,
});

const AddressLevelSinglePicker = ({ value, onChange, label }) => {
  const [selected, setSelected] = useState(null);
  const [defaultOptions, setDefaultOptions] = useState([]);

  const fetchLocations = useCallback((input, callback) => {
    const term = encodeURIComponent(deburr((input || "").trim()).toLowerCase());
    httpClient
      .get(`/locations/search/find?title=${term}&size=100&page=0`)
      .then((resp) => callback(map(get(resp, "data.content", []), toOption)));
  }, []);

  useEffect(() => {
    if (value && (!selected || selected.value !== value)) {
      httpClient
        .get(`/locations/search/findAllById?ids=${value}`)
        .then((resp) => {
          const list = resp.data;
          const first = Array.isArray(list) ? list[0] : null;
          if (first) setSelected(toOption(first));
        });
    } else if (!value && selected) {
      setSelected(null);
    }
  }, [value, selected]);

  useEffect(() => {
    fetchLocations("", setDefaultOptions);
  }, [fetchLocations]);

  const loadOptions = useMemo(
    () => debounce((input, callback) => fetchLocations(input, callback), 400),
    [fetchLocations],
  );

  useEffect(() => () => loadOptions.cancel(), [loadOptions]);

  return (
    <FormControl fullWidth>
      {label && <FormLabel sx={{ mb: 0.5 }}>{label}</FormLabel>}
      <AsyncSelect
        cacheOptions
        defaultOptions={defaultOptions}
        isClearable
        value={selected}
        placeholder="Start typing a location name"
        loadOptions={loadOptions}
        formatOptionLabel={(opt) => <div>{opt.optionLabel || opt.label}</div>}
        onChange={(opt) => {
          setSelected(opt);
          onChange(opt ? opt.value : null, opt ? opt.raw : null);
        }}
      />
    </FormControl>
  );
};

export default AddressLevelSinglePicker;
