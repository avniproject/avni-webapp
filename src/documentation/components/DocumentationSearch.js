import React from "react";
import { get, isEmpty, isNil, map } from "lodash";
import http from "common/utils/httpClient";
import CommonSearch from "../../formDesigner/common/CommonSearch";
import { Link } from "react-router-dom";
import DeleteIcon from "@material-ui/icons/HighlightOff";
import { IconButton } from "@material-ui/core";
import Colors from "../../dataEntryApp/Colors";

const getAllParents = (documentation, parents) => {
  if (isNil(documentation)) return parents;
  parents.push(documentation.name);
  return getAllParents(documentation.parent, parents);
};

const DocumentationSearch = ({ value, onChange, isMulti, placeholder }) => {
  const loadDocumentation = (value, callback) => {
    http.get("/search/documentation?name=" + value).then(response => {
      const options = map(get(response, "data.content", []), ({ name, uuid, parent }) => {
        const allParents = getAllParents(parent, []);
        const label = isEmpty(allParents) ? name : `${name} in (${allParents.join(" -> ")})`;
        return {
          label: label,
          value: uuid
        };
      });
      callback(options);
    });
  };

  const renderEdit = () => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link to={{ pathname: "/documentation", state: { documentationUUID: value.value } }}>{value.label}</Link>
        <IconButton size={"small"} onClick={() => onChange(null)}>
          <DeleteIcon style={{ color: Colors.ValidationError }} />
        </IconButton>
      </div>
    );
  };

  const renderSearch = () => {
    return (
      <CommonSearch
        value={value}
        onChange={onChange}
        isMulti={isMulti}
        placeholder={placeholder || "Type to search Documentation"}
        loadOptionsByValue={loadDocumentation}
      />
    );
  };

  return isNil(value) ? renderSearch() : renderEdit();
};

export default DocumentationSearch;
