import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import { SaveComponent } from "../../common/components/SaveComponent";
import { MenuItem } from "openchs-models";
import ApplicationMenuReducer from "../Reducers/ApplicationMenuReducer";
import EntityEditUtil from "../Util/EntityEditUtil";
import ApplicationMenuEditFields from "./ApplicationMenuEditFields";

const ApplicationMenuEdit = props => {
  const [state, dispatch] = useReducer(
    ApplicationMenuReducer.getReducer(),
    ApplicationMenuReducer.createApplicationMenuInitialState()
  );
  const [redirectShow, setRedirectShow] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);

  useEffect(() => {
    http
      .get("/web/menuItem/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        const menuItem = MenuItem.fromResource(result);
        menuItem.id = result.id;
        dispatch({ type: ApplicationMenuReducer.INITIAL_MENU_ITEM, payload: menuItem });
      });
  }, []);

  const onSubmit = () => {
    http
      .put("/web/menuItem/" + props.match.params.id, state.menuItem)
      .then(response => {
        if (response.status === 200) {
          dispatch({ type: ApplicationMenuReducer.SAVED });
        }
      })
      .catch(error => dispatch({ type: ApplicationMenuReducer.SAVE_FAILED, payload: error }));
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Edit application menu "} />
        <Grid container item={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
            <VisibilityIcon /> Show
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          <ApplicationMenuEditFields menuItem={state.menuItem} dispatch={dispatch} />
          <p />
        </div>
        <Grid container item sm={12}>
          <Grid item sm={1}>
            <SaveComponent name="save" onSubmit={onSubmit} styleClass={{ marginLeft: "14px" }} />
          </Grid>
          <Grid item sm={11}>
            <Button
              style={{
                float: "right",
                color: "red"
              }}
              onClick={() =>
                EntityEditUtil.onDelete("menuItem", props.match.params.id, "application menu", () =>
                  setDeleteAlert(true)
                )
              }
            >
              <DeleteIcon /> Delete
            </Button>
          </Grid>
        </Grid>
      </Box>
      {(redirectShow || state.saved) && (
        <Redirect to={`/appDesigner/applicationMenu/${props.match.params.id}/show`} />
      )}
      {deleteAlert && <Redirect to="/appDesigner/applicationMenu" />}
    </>
  );
};

export default ApplicationMenuEdit;
