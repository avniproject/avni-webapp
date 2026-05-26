import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import { debounce, deburr, get, isNil, map, sortBy } from "lodash";
import { Box, FormControl, FormLabel } from "@mui/material";
import { useDataProvider } from "react-admin";
import { httpClient } from "common/utils/httpClient";

const toOption = (location) => ({
  label: location.title,
  value: location.id,
  raw: location,
});

const buildTypeChain = (types) => {
  if (!types || types.length === 0) return [];
  const root = types.find((t) => isNil(t.parentId));
  if (!root) return [];
  const chain = [root];
  let current = root;
  while (true) {
    const next = types.find((t) => t.parentId === current.id);
    if (!next) break;
    chain.push(next);
    current = next;
  }
  return chain;
};

const CascadingAncestorFilter = ({ onChange }) => {
  const dataProvider = useDataProvider();
  const [typeChain, setTypeChain] = useState([]);
  const [selections, setSelections] = useState([]);

  useEffect(() => {
    dataProvider
      .getList("addressLevelType", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "level", order: "DESC" },
        filter: {},
      })
      .then(({ data }) => {
        const raw = Array.isArray(data)
          ? data
          : data?._embedded?.addressLevelType || [];
        const normalised = raw.map((t) => ({
          id: t.id,
          name: t.name,
          parentId: t.parentId ?? null,
          level: t.level,
        }));
        setTypeChain(buildTypeChain(sortBy(normalised, (t) => -t.level)));
      })
      .catch(() => setTypeChain([]));
  }, [dataProvider]);

  const fetchLocations = useCallback((typeId, parentId, input, callback) => {
    const term = encodeURIComponent(deburr((input || "").trim()).toLowerCase());
    const parts = [`title=${term}`, `typeId=${typeId}`, `size=100`, `page=0`];
    if (parentId) parts.push(`parentId=${parentId}`);
    httpClient
      .get(`/locations/search/find?${parts.join("&")}`)
      .then((resp) => callback(map(get(resp, "data.content", []), toOption)))
      .catch(() => callback([]));
  }, []);

  const handleSelect = (levelIndex, option) => {
    const next = selections.slice(0, levelIndex);
    if (option) next.push(option.raw);
    setSelections(next);
    const last = next.length > 0 ? next[next.length - 1] : null;
    onChange(last);
  };

  const levelsToRender = Math.min(selections.length + 1, typeChain.length);

  if (typeChain.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {Array.from({ length: levelsToRender }).map((_, levelIndex) => {
        const type = typeChain[levelIndex];
        const parentId = levelIndex > 0 ? selections[levelIndex - 1]?.id : null;
        const selectedAtLevel = selections[levelIndex]
          ? toOption(selections[levelIndex])
          : null;
        return (
          <CascadingLevel
            key={`${type.id}-${parentId ?? "root"}`}
            type={type}
            parentId={parentId}
            value={selectedAtLevel}
            fetchLocations={fetchLocations}
            onSelect={(option) => handleSelect(levelIndex, option)}
          />
        );
      })}
    </Box>
  );
};

const CascadingLevel = ({
  type,
  parentId,
  value,
  fetchLocations,
  onSelect,
}) => {
  const [defaultOptions, setDefaultOptions] = useState([]);

  useEffect(() => {
    fetchLocations(type.id, parentId, "", setDefaultOptions);
  }, [type.id, parentId, fetchLocations]);

  const loadOptions = useMemo(
    () =>
      debounce(
        (input, callback) => fetchLocations(type.id, parentId, input, callback),
        400,
      ),
    [type.id, parentId, fetchLocations],
  );

  useEffect(() => () => loadOptions.cancel(), [loadOptions]);

  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 0.5, fontSize: "0.75rem" }}>{type.name}</FormLabel>
      <AsyncSelect
        cacheOptions
        defaultOptions={defaultOptions}
        isClearable
        value={value}
        placeholder={`Select ${type.name}`}
        loadOptions={loadOptions}
        onChange={(option) => onSelect(option || null)}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </FormControl>
  );
};

export default CascadingAncestorFilter;
