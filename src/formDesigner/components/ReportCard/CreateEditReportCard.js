import React from "react";
import { ReportCardReducer } from "./ReportCardReducer";
import http from "../../../common/utils/httpClient";
import { find, get, isEmpty, isNil } from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/core/SvgIcon/SvgIcon";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { Title } from "react-admin";
import DeleteIcon from "@material-ui/icons/Delete";
import { Redirect } from "react-router-dom";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import ColorPicker from "material-ui-rc-color-picker";
import { colorPickerCSS } from "../../../adminApp/Constant";
import { sampleCardQuery } from "../../common/SampleRule";

const initialState = { name: "", description: "", color: "#ff0000", query: "" };
export const CreateEditReportCard = ({ edit, ...props }) => {
  const [card, dispatch] = React.useReducer(ReportCardReducer, initialState);
  const [error, setError] = React.useState([]);
  const [id, setId] = React.useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = React.useState(false);

  React.useEffect(() => {
    if (edit) {
      http
        .get(`/web/card/${props.match.params.id}`)
        .then(res => res.data)
        .then(res => {
          dispatch({ type: "setData", payload: res });
        });
    }
  }, []);

  const validateRequest = () => {
    const { name, color, query } = card;
    if (isEmpty(name) && isEmpty(color) && isEmpty(query)) {
      setError([
        { key: "EMPTY_NAME", message: "Name cannot be empty" },
        { key: "EMPTY_COLOR", message: "Colour cannot be empty" },
        { key: "EMPTY_QUERY", message: "Query cannot be empty" }
      ]);
    } else if (isEmpty(name)) {
      setError([...error, { key: "EMPTY_NAME", message: "Name cannot be empty" }]);
    } else if (isEmpty(color)) {
      setError([...error, { key: "EMPTY_COLOR", message: "Colour cannot be empty" }]);
    } else if (isEmpty(query)) {
      setError([...error, { key: "EMPTY_QUERY", message: "Query cannot be empty" }]);
    }
  };

  const onSave = () => {
    validateRequest();
    if (!isEmpty(card.name) && !isEmpty(card.color) && !isEmpty(card.query)) {
      const url = edit ? `/web/card/${props.match.params.id}` : "/web/card";
      const methodName = edit ? "put" : "post";
      http[methodName](url, card)
        .then(res => {
          if (res.status === 200) {
            setId(res.data.id);
          }
        })
        .catch(error => {
          setError([
            {
              key: "SERVER_ERROR",
              message: `${get(error, "response.data") ||
                get(error, "message") ||
                "error while saving card"}`
            }
          ]);
        });
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete card record?")) {
      http
        .delete(`/web/card/${props.match.params.id}`)
        .then(response => {
          if (response.status === 200) {
            setRedirectAfterDelete(true);
          }
        })
        .catch(error => console.error(error));
    }
  };

  const onChange = (type, event, errorKey) => {
    setError(error.filter(({ key }) => key !== errorKey));
    dispatch({ type: type, payload: event.target.value });
  };

  const getErrorByKey = errorKey => {
    const errorByKey = find(error, ({ key }) => key === errorKey);
    return isEmpty(errorByKey) ? null : (
      <FormLabel error style={{ fontSize: "12px" }}>
        {errorByKey.message}
      </FormLabel>
    );
  };

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title={"Create Card"} />
      <DocumentationContainer filename={"Card.md"}>
        {edit && (
          <Grid container style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setId(props.match.params.id)}>
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <AvniTextField
          multiline
          id="name"
          label="Name*"
          autoComplete="off"
          value={card.name}
          onChange={event => onChange("name", event, "EMPTY_NAME")}
          toolTipKey={"APP_DESIGNER_CARD_NAME"}
        />
        {getErrorByKey("EMPTY_NAME")}
        <p />
        <AvniTextField
          multiline
          id="description"
          label="Description"
          autoComplete="off"
          value={card.description}
          onChange={event => dispatch({ type: "description", payload: event.target.value })}
          toolTipKey={"APP_DESIGNER_CARD_DESCRIPTION"}
        />
        <p />
        <AvniFormLabel label={"Colour Picker"} toolTipKey={"APP_DESIGNER_CARD_COLOR"} />
        <ColorPicker
          id="colour"
          label="Colour"
          style={colorPickerCSS}
          color={card.color}
          onChange={color => dispatch({ type: "color", payload: color.color })}
        />
        <p />
        {getErrorByKey("EMPTY_COLOR")}
        <AvniFormLabel label={"Query"} toolTipKey={"APP_DESIGNER_CARD_QUERY"} />
        <Editor
          value={card.query || sampleCardQuery()}
          onValueChange={event => dispatch({ type: "query", payload: event })}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 15,
            height: "auto",
            borderStyle: "solid",
            borderWidth: "1px"
          }}
        />
        {getErrorByKey("EMPTY_QUERY")}
        <p />
        {getErrorByKey("SERVER_ERROR")}
        <Grid container direction={"row"}>
          <Grid item xs={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid item xs={11}>
            {edit && (
              <Button style={{ float: "right", color: "red" }} onClick={onDelete}>
                <DeleteIcon /> Delete
              </Button>
            )}
          </Grid>
        </Grid>
        {!isNil(id) && <Redirect to={`/appDesigner/reportCard/${id}/show`} />}
        {redirectAfterDelete && <Redirect to="/appDesigner/reportCard" />}
      </DocumentationContainer>
    </Box>
  );
};
