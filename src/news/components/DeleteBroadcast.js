import React from "react";
import { AvniAlertDialog } from "./AvniAlertDialog";
import { DialogActionButton } from "./DialogActionButton";
import API from "../api";

export const DeleteBroadcast = ({ open, setOpen, setRedirect, news }) => {
  const deleteNews = () => {
    API.deleteNews(news.id)
      .then(response => {
        if (response.status === 200) {
          setRedirect(true);
        }
      })
      .catch(error => console.error(error));
  };

  const actions = [];
  actions.push(
    <DialogActionButton
      color={"#ffffff"}
      onClick={() => setOpen(false)}
      textColor={"rgba(0,0,0,0.55)"}
      text={"Cancel"}
    />
  );
  actions.push(
    <DialogActionButton
      color={"#bf360c"}
      onClick={deleteNews}
      textColor={"#ffffff"}
      text={"Confirm delete"}
    />
  );

  return (
    <AvniAlertDialog
      open={open}
      setOpen={setOpen}
      title={" Delete broadcast news?"}
      message={"Are you sure you want to delete the broadcast news."}
      actions={actions}
    />
  );
};
