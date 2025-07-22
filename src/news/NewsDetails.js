import { useState, useEffect, useReducer } from "react";
import { styled } from "@mui/material/styles";
import { newsInitialState, NewsReducer } from "./reducers";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { Paper } from "@mui/material";
import { CreateEditNews } from "./CreateEditNews";
import { Navigate } from "react-router-dom";
import { PublishBroadcast } from "./components/PublishBroadcast";
import { DeleteBroadcast } from "./components/DeleteBroadcast";
import API from "./api";
import NewsDetailsCard from "./components/NewsDetailsCard";

const StyledContainer = styled("div")({
  flexGrow: 1
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.25), // 10px
  margin: "auto",
  maxWidth: "70%"
}));

export default function NewsDetails({ history, ...props }) {
  const [news, dispatch] = useReducer(NewsReducer, newsInitialState);
  const [openEdit, setOpenEdit] = useState(false);
  const [redirectToListing, setRedirectToListing] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [publishAlert, setPublishAlert] = useState(false);

  useEffect(() => {
    API.getNewsById(props.match.params.id)
      .then(res => res.data)
      .then(res => {
        dispatch({ type: "setData", payload: res });
      });
  }, [openEdit]);

  return (
    <ScreenWithAppBar appbarTitle="News broadcast">
      <StyledContainer>
        <StyledPaper>
          <NewsDetailsCard
            news={news}
            history={history}
            displayActions={true}
            setDeleteAlert={setDeleteAlert}
            setOpenEdit={setOpenEdit}
            setPublishAlert={setPublishAlert}
          />
        </StyledPaper>
        <CreateEditNews
          open={openEdit}
          headerTitle="Edit news broadcast"
          handleClose={() => setOpenEdit(false)}
          edit={true}
          existingNews={news}
        />
        <PublishBroadcast open={publishAlert} setOpen={setPublishAlert} setRedirect={setRedirectToListing} news={news} />
        <DeleteBroadcast open={deleteAlert} setOpen={setDeleteAlert} setRedirect={setRedirectToListing} news={news} />
      </StyledContainer>
      {redirectToListing && <Navigate to="/broadcast/news" />}
    </ScreenWithAppBar>
  );
}
