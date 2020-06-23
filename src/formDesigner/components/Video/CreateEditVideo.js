import React from "react";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { SaveComponent } from "../../../common/components/SaveComponent";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { find, get, isEmpty, isNil } from "lodash";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { VideoReducer } from "./VideoReducer";
import { Redirect } from "react-router-dom";
import FormLabel from "@material-ui/core/FormLabel";
import http from "../../../common/utils/httpClient";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";

const initialState = { title: "", fileName: "", duration: "", description: "" };
export const CreateEditVideo = ({ edit, ...props }) => {
  const [video, dispatch] = React.useReducer(VideoReducer, initialState);
  const [error, setError] = React.useState([]);
  const [id, setId] = React.useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = React.useState(false);

  React.useEffect(() => {
    if (edit) {
      http
        .get(`/web/video/${props.match.params.id}`)
        .then(res => res.data)
        .then(res => {
          dispatch({ type: "setData", payload: res });
        });
    }
  }, []);

  const validateRequest = () => {
    const { title, fileName } = video;
    if (isEmpty(title) && isEmpty(fileName)) {
      setError([
        { key: "EMPTY_FILE_NAME", message: "Filename cannot be empty" },
        { key: "EMPTY_TITLE", message: "Title cannot be empty" }
      ]);
    } else if (isEmpty(title)) {
      setError([...error, { key: "EMPTY_TITLE", message: "Title cannot be empty" }]);
    } else if (isEmpty(fileName)) {
      setError([...error, { key: "EMPTY_FILE_NAME", message: "Filename cannot be empty" }]);
    }
  };

  const onSave = () => {
    validateRequest();
    if (!isEmpty(video.title) && !isEmpty(video.fileName)) {
      const url = edit ? `/web/video/${props.match.params.id}` : "/web/video";
      http
        .post(url, video)
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
                "error while saving video"}`
            }
          ]);
        });
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete video record?")) {
      http
        .delete(`/web/video/${props.match.params.id}`)
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
      <Title title={"Create Relationship"} />
      <DocumentationContainer filename={"Video.md"}>
        {edit && (
          <Grid container style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setId(props.match.params.id)}>
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <AvniTextField
          id="name"
          label="Name*"
          autoComplete="off"
          value={video.title}
          onChange={event => onChange("name", event, "EMPTY_TITLE")}
          toolTipKey={"APP_DESIGNER_VIDEO_NAME"}
        />
        {getErrorByKey("EMPTY_TITLE")}
        <p />
        <AvniTextField
          multiline
          id="description"
          label="Description"
          autoComplete="off"
          value={video.description}
          onChange={event => dispatch({ type: "description", payload: event.target.value })}
          toolTipKey={"APP_DESIGNER_VIDEO_DESCRIPTION"}
        />
        <p />
        <AvniTextField
          id="fileName"
          label="File Name*"
          autoComplete="off"
          value={video.fileName}
          onChange={event => onChange("fileName", event, "EMPTY_FILE_NAME")}
          toolTipKey={"APP_DESIGNER_VIDEO_FILE_NAME"}
        />
        {getErrorByKey("EMPTY_FILE_NAME")}
        <p />
        <AvniTextField
          id="duration"
          label="Duration (in seconds)"
          autoComplete="off"
          value={video.duration}
          onChange={event => dispatch({ type: "duration", payload: event.target.value })}
          toolTipKey={"APP_DESIGNER_VIDEO_DURATION"}
        />
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
        {!isNil(id) && <Redirect to={`/appDesigner/video/${id}/show`} />}
        {redirectAfterDelete && <Redirect to="/appDesigner/video" />}
      </DocumentationContainer>
    </Box>
  );
};
