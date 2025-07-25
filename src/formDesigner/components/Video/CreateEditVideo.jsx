import { useReducer, useState, useEffect } from "react";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { SaveComponent } from "../../../common/components/SaveComponent";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { isEmpty, isNil } from "lodash";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { VideoReducer } from "./VideoReducer";
import { Navigate } from "react-router-dom";
import { httpClient as http } from "../../../common/utils/httpClient";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { createServerError, getErrorByKey } from "../../common/ErrorUtil";

const initialState = { title: "", fileName: "", duration: "", description: "" };
export const CreateEditVideo = ({ edit, ...props }) => {
  const [video, dispatch] = useReducer(VideoReducer, initialState);
  const [error, setError] = useState([]);
  const [id, setId] = useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = useState(false);

  useEffect(() => {
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
      setError([
        ...error,
        { key: "EMPTY_TITLE", message: "Title cannot be empty" }
      ]);
    } else if (isEmpty(fileName)) {
      setError([
        ...error,
        { key: "EMPTY_FILE_NAME", message: "Filename cannot be empty" }
      ]);
    }
  };

  const onSave = () => {
    validateRequest();
    if (!isEmpty(video.title) && !isEmpty(video.fileName)) {
      const url = edit ? `/web/video/${props.match.params.id}` : "/web/video";
      return http
        .post(url, video)
        .then(res => {
          if (res.status === 200) {
            setId(res.data.id);
          }
        })
        .catch(error => {
          setError([createServerError(error, "error while saving video")]);
        });
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete video record?")) {
      http.delete(`/web/video/${props.match.params.id}`).then(response => {
        if (response.status === 200) {
          setRedirectAfterDelete(true);
        }
      });
    }
  };

  const onChange = (type, event, errorKey) => {
    setError(error.filter(({ key }) => key !== errorKey));
    dispatch({ type: type, payload: event.target.value });
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title={"Create Video"} />
      <DocumentationContainer filename={"Video.md"}>
        {edit && (
          <Grid container style={{ justifyContent: "flex-end" }}>
            <Button
              color="primary"
              type="button"
              onClick={() => setId(props.match.params.id)}
            >
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
        {getErrorByKey(error, "EMPTY_TITLE")}
        <p />
        <AvniTextField
          multiline
          id="description"
          label="Description"
          autoComplete="off"
          value={video.description}
          onChange={event =>
            dispatch({ type: "description", payload: event.target.value })
          }
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
        {getErrorByKey(error, "EMPTY_FILE_NAME")}
        <p />
        <AvniTextField
          id="duration"
          label="Duration (in seconds)"
          autoComplete="off"
          value={video.duration}
          onChange={event =>
            dispatch({ type: "duration", payload: event.target.value })
          }
          toolTipKey={"APP_DESIGNER_VIDEO_DURATION"}
        />
        <p />
        {getErrorByKey(error, "SERVER_ERROR")}
        <Grid container direction={"row"}>
          <Grid size={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid size={11}>
            {edit && (
              <Button
                style={{ float: "right", color: "red" }}
                onClick={onDelete}
              >
                <DeleteIcon /> Delete
              </Button>
            )}
          </Grid>
        </Grid>
        {!isNil(id) && <Navigate to={`/appDesigner/video/${id}/show`} />}
        {redirectAfterDelete && <Navigate to="/appDesigner/video" />}
      </DocumentationContainer>
    </Box>
  );
};
