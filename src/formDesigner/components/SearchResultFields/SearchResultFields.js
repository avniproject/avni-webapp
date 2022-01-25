import React, { useEffect, useReducer } from "react";
import Box from "@material-ui/core/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Title } from "react-admin";
import { get, map, find, isEmpty, differenceBy } from "lodash";
import http from "../../../common/utils/httpClient";
import { SearchFieldReducer } from "./SearchFieldReducer";
import SearchResultFieldState from "./SearchResultFieldState";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import api from "../../../dataEntryApp/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Select from "react-select";
import CustomizedBackdrop from "../../../dataEntryApp/components/CustomizedBackdrop";
import { Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import Colors from "../../../dataEntryApp/Colors";
import { SaveComponent } from "../../../common/components/SaveComponent";
import CustomizedSnackbar from "../CustomizedSnackbar";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
const grid = 6;
const getItemStyle = (isDragging, draggableStyle) => ({
  flex: 1,
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  cursor: "move",
  background: isDragging ? "lightgreen" : "white",
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid
});

const SearchResultFields = () => {
  const [state, dispatch] = useReducer(SearchFieldReducer, new SearchResultFieldState());
  const orgConfigKey = "searchResultFields";
  const {
    selectedSubjectTypeUUID,
    loadApp,
    subjectTypeMetadata,
    searchResultFields,
    feedbackMessage
  } = state;
  const selectedSubjectTypeMetadata = find(
    subjectTypeMetadata,
    ({ subjectType }) => subjectType.uuid === selectedSubjectTypeUUID
  );
  const selectedCustomFields = state.getFieldsForSelectedSubjectType();
  const allConcepts = get(selectedSubjectTypeMetadata, "concepts");
  const possibleOptions = differenceBy(allConcepts, selectedCustomFields, "uuid");

  useEffect(() => {
    http
      .fetchJson("/web/subjectTypeMetadata")
      .then(response => response.json)
      .then(res => {
        dispatch({ type: "setMetadata", payload: res });
      });
  }, []);

  useEffect(() => {
    api.fetchOrganisationConfigs().then(config => {
      dispatch({ type: "setData", payload: get(config, `organisationConfig.${orgConfigKey}`, []) });
    });
  }, []);

  const onSave = () => {
    const payload = { settings: { [orgConfigKey]: searchResultFields } };
    http
      .put("/organisationConfig", payload)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          dispatch({ type: "saveOk" });
        }
      })
      .catch(error => {
        dispatch({ type: "saveError" });
        console.error(error);
      });
  };

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }
    const searchResultConcepts = reorder(
      selectedCustomFields,
      result.source.index,
      result.destination.index
    );

    dispatch({ type: "changeOrder", payload: { searchResultConcepts } });
  };

  const renderSubjectTypes = () => (
    <FormControl component="fieldset">
      <FormLabel component="legend">{"Subject types"}</FormLabel>
      <RadioGroup row aria-label="position" name="position">
        <RadioGroup row aria-label="conjunction" value={selectedSubjectTypeUUID || ""}>
          {map(subjectTypeMetadata, ({ subjectType }) => (
            <FormControlLabel
              key={subjectType.uuid}
              control={<Radio color="primary" />}
              value={subjectType.uuid}
              label={subjectType.name}
              onChange={() =>
                dispatch({
                  type: "subjectTypeChange",
                  payload: { subjectTypeUUID: subjectType.uuid }
                })
              }
            />
          ))}
        </RadioGroup>
      </RadioGroup>
    </FormControl>
  );

  const renderDraggableFields = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {map(selectedCustomFields, ({ name, uuid }, index) => (
              <Draggable key={uuid} draggableId={uuid} index={index}>
                {(provided, snapshot) => (
                  <Box
                    display="flex"
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    alignItems={"center"}
                  >
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    >
                      {name}
                    </div>
                    <Box style={{ display: snapshot.isDragging ? "none" : "block" }}>
                      <Button
                        size="small"
                        onClick={() => dispatch({ type: "deleteField", payload: { uuid } })}
                      >
                        <DeleteIcon style={{ color: Colors.ValidationError }} />
                      </Button>
                    </Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  const renderNotConfiguredMessage = () => (
    <Typography component={"div"} variant={"subtitle1"}>
      {"No fields configured for this subject type. Please select the fields from the dropdown."}
    </Typography>
  );

  return (
    <Box boxShadow={2} p={5} bgcolor="background.paper">
      <Title title="Search Result Fields" />
      <CustomizedBackdrop load={loadApp} />
      {loadApp && (
        <DocumentationContainer filename={"SearchResultFields.md"}>
          {renderSubjectTypes()}
          <Select
            placeholder="Select to add new custom search field"
            value={null}
            options={possibleOptions}
            getOptionLabel={option => option.name}
            getOptionValue={option => option.uuid}
            style={{ width: "auto" }}
            onChange={concept => dispatch({ type: "addCustomField", payload: { concept } })}
          />
          <Box mt={3} mb={5}>
            <Typography component={"div"} variant={"h6"} gutterBottom>
              {"Custom search fields"}
            </Typography>
            {isEmpty(selectedCustomFields) ? renderNotConfiguredMessage() : renderDraggableFields()}
          </Box>
          <SaveComponent name="Save" onSubmit={onSave} />
        </DocumentationContainer>
      )}
      {!isEmpty(feedbackMessage) && (
        <CustomizedSnackbar
          message={feedbackMessage.message}
          variant={feedbackMessage.variant}
          getDefaultSnackbarStatus={() => dispatch({ type: "resetFeedback" })}
          defaultSnackbarStatus={!isEmpty(feedbackMessage)}
        />
      )}
    </Box>
  );
};

export default SearchResultFields;
