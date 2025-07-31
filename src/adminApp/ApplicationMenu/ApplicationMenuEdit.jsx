import { useEffect, useReducer, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Grid, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { SaveComponent } from "../../common/components/SaveComponent";
import ApplicationMenuReducer from "../Reducers/ApplicationMenuReducer";
import EntityEditUtil from "../Util/EntityEditUtil";
import ApplicationMenuEditFields from "./ApplicationMenuEditFields";
import ApplicationMenuService from "../service/ApplicationMenuService";
import _ from "lodash";
import FormLabel from "@mui/material/FormLabel";

const ApplicationMenuEdit = () => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(
    ApplicationMenuReducer.execute,
    ApplicationMenuReducer.createApplicationMenuInitialState()
  );
  const [redirectShow, setRedirectShow] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);

  function isCreate() {
    return _.isEmpty(id);
  }

  useEffect(() => {
    if (!isCreate())
      ApplicationMenuService.getMenuItem(id).then(menuItem =>
        dispatch({
          type: ApplicationMenuReducer.INITIAL_MENU_ITEM,
          payload: menuItem
        })
      );
  }, []);

  const onSubmit = () => {
    dispatch({
      type: ApplicationMenuReducer.SUBMITTED,
      payload: {
        cb: () => {
          const savePromise = isCreate()
            ? ApplicationMenuService.post(state.menuItem)
            : ApplicationMenuService.put(state.menuItem);
          savePromise
            .then(response => {
              if (response.status === 200) {
                dispatch({ type: ApplicationMenuReducer.SAVED });
              }
            })
            .catch(error =>
              dispatch({
                type: ApplicationMenuReducer.SAVE_FAILED,
                payload: error
              })
            );
        }
      }
    });
  };

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <Title title={`${isCreate() ? "Create" : "Edit"} application menu`} />
        {!isCreate() && (
          <Grid container={12} style={{ justifyContent: "flex-end" }}>
            <Button
              color="primary"
              type="button"
              onClick={() => setRedirectShow(true)}
            >
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <Stack>
          <Box>
            <ApplicationMenuEditFields
              menuItem={state.menuItem}
              dispatch={dispatch}
              errors={state.errors}
            />
            <p />
          </Box>
          {state.errors.size > 0 &&
            Array.from(state.errors.values()).map(error => (
              <div>
                <FormLabel
                  error
                  style={{
                    marginTop: "10px",
                    fontSize: "14px",
                    marginLeft: "14px"
                  }}
                >
                  {error}
                </FormLabel>
                <br />
              </div>
            ))}
          <p />
          <Grid
            container
            size={{
              sm: 12
            }}
          >
            <Grid
              size={{
                sm: 1
              }}
            >
              <SaveComponent name="save" onSubmit={onSubmit} />
            </Grid>
            {!isCreate() && (
              <Grid
                size={{
                  sm: 11
                }}
              >
                <Button
                  style={{
                    float: "right",
                    color: "red"
                  }}
                  onClick={() =>
                    EntityEditUtil.onDelete(
                      "menuItem",
                      id,
                      "application menu",
                      () => setDeleteAlert(true)
                    )
                  }
                >
                  <DeleteIcon /> Delete
                </Button>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Box>
      {(redirectShow || state.saved) && (
        <Navigate
          to={
            isCreate()
              ? "/appDesigner/applicationMenu"
              : `/appDesigner/applicationMenu/${id}/show`
          }
        />
      )}
      {deleteAlert && <Navigate to="/appDesigner/applicationMenu" />}
    </>
  );
};

export default ApplicationMenuEdit;
