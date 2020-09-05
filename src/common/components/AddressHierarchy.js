import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import Select from "react-select";
import httpClient from "../utils/httpClient";
import { Grid } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(0.5),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1)
  }
}));

//This returns the lowest addressLevels based on any selected addressLevel
const AddressHierarchy = ({ setLowestAddressLevels, lowestAddressLevels }) => {
  const classes = useStyles();
  const [data, setData] = React.useState([]);
  const [selectedAddresses, setSelectedAddresses] = React.useState([]);
  const [levelsToRender, setLevelsToRender] = React.useState([]);

  React.useEffect(() => {
    httpClient.get("/locations/web/getAll").then(res => {
      const data = res.data;
      setData(data);
      setLevelsToRender(data);
      setSelectedAddresses(getInitialState(data));
    });
  }, []);

  const getInitialState = data => {
    const initialState = {};
    _.forEach(_.uniqBy(data, "type"), ({ type, level }) =>
      _.assign(initialState, { [type]: { level, addresses: [] } })
    );
    return initialState;
  };

  const handleChange = (event, type, level) => {
    const parentIDs = _.map(event, e => e.value);
    const childrenLevels = data.filter(({ parentId }) => _.includes(parentIDs, parentId));
    //TODO: change this based on lineage instead of parentId
    const levelsWithoutChildren = removeTypes(childrenLevels.map(({ type }) => type));
    setLevelsToRender([...levelsWithoutChildren, ...childrenLevels]);
    setSelectedAddresses({ ...selectedAddresses, [type]: { level, addresses: event } });
  };

  const lowestSelectedAddresses = () => {
    if (isSelectedAddressesEmpty()) return [];
    const minLevel = getMinLevelFromSelectedAddresses();
    return _.omitBy(selectedAddresses, ({ level }) => level !== minLevel);
  };

  const isSelectedAddressesEmpty = () => {
    return _.every(_.values(selectedAddresses), ({ addresses }) => _.isEmpty(addresses));
  };

  const getMinLevelFromSelectedAddresses = () => {
    const nonEmptyAddresses = _.omitBy(selectedAddresses, ({ addresses }) => _.isEmpty(addresses));
    return _.min(_.flatMap(nonEmptyAddresses, (v, k) => v.level));
  };

  const removeTypes = typesToRemove => {
    return _.reject(data, ({ type }) => _.includes(typesToRemove, type));
  };

  const isLeaf = child => {
    return child.level === minLevel(child.lineage);
  };

  const minLevel = selectedLineage => {
    return _.minBy(_.filter(data, ({ lineage }) => _.startsWith(lineage, selectedLineage)), "level")
      .level;
  };

  const getLeavesOfParent = parent => {
    if (isLeaf(parent)) {
      return parent;
    }
    const children = _.filter(data, ({ parentId }) => parentId === parent.id);
    if (_.isEmpty(children)) {
      return [];
    } else if (isLeaf(_.first(children))) {
      return children;
    }
    return _.flatten(children.map(c => getLeavesOfParent(c)));
  };

  const filterFromData = lowestAddresses => {
    const allAddressIds = [];
    _.forIn(lowestAddresses, (value, type) =>
      allAddressIds.push(..._.map(value.addresses, ({ value }) => value))
    );
    return _.filter(data, ({ id }) => _.includes(allAddressIds, id));
  };

  const createListOptions = addresses =>
    _.map(addresses, ({ name, id }) => ({ label: name, value: id }));

  const lowestSelected = filterFromData(lowestSelectedAddresses()).reduce(
    (acc, parent) => acc.concat(getLeavesOfParent(parent)),
    []
  );

  if (!_.isEqual(lowestSelected, lowestAddressLevels)) {
    setLowestAddressLevels(lowestSelected);
  }

  return (
    <Grid container xs={6} style={{ marginBottom: "10px" }}>
      <FormLabel component="legend">{"Address"}</FormLabel>
      <div style={{ border: "2px dashed #dbdbdb", flex: 1, padding: 8 }}>
        {!_.isEmpty(levelsToRender) &&
          !_.isEmpty(selectedAddresses) &&
          _.map(
            _.groupBy(_.orderBy(levelsToRender, "level", "desc"), "type"),
            (addresses, type) => (
              <FormControl
                fullWidth
                component="fieldset"
                className={classes.formControl}
                key={type}
              >
                <FormLabel component="legend">{type}</FormLabel>
                <Select
                  isMulti
                  isSearchable
                  placeholder={`Select ${type}`}
                  value={selectedAddresses[type].addresses}
                  options={createListOptions(addresses)}
                  onChange={event => handleChange(event, type, selectedAddresses[type].level)}
                />
              </FormControl>
            )
          )}
      </div>
    </Grid>
  );
};

export default AddressHierarchy;
