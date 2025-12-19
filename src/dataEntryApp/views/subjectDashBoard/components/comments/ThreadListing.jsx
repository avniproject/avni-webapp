import { Fragment, useState } from "react";
import { styled } from "@mui/material/styles";
import { head, map, sortBy } from "lodash";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Comment, ChevronRight } from "@mui/icons-material";
import {
  clearCommentError,
  onThreadReply,
} from "../../../../reducers/CommentReducer";
import NewCommentThreadDialog from "./NewCommentThreadDialog";
import { CommentCard } from "./CommentCard";
import { useTranslation } from "react-i18next";

const StyledHeader = styled("div")(({ theme }) => ({
  width: 500,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  backgroundColor: "#313a46",
}));

const StyledCommentButton = styled(Button)({
  color: "#3949ab",
  background: "#fff",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#bababa",
  },
});

const StyledIconContainer = styled("div")({
  display: "flex",
  backgroundColor: "#556479",
  height: 40,
  width: 50,
  alignItems: "center",
  marginLeft: 5,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: 500,
  backgroundColor: "#f5f5f5",
  height: "100%",
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  flexWrap: "wrap",
  elevation: 0,
}));

const StyledCommentIcon = styled(Comment)({
  color: "#fff",
  marginRight: 5,
  marginLeft: 5,
});

const StyledChevronRight = styled(ChevronRight)({
  color: "#fff",
});

const StyledTypography = styled(Typography)({
  color: "#fff",
});

export const ThreadListing = ({
  commentThreads,
  dispatch,
  setOpen,
  newCommentText,
  onCommentChange,
  subjectUUID,
  commentError,
}) => {
  const { t } = useTranslation();
  const [openCommentThread, setOpenCommentThread] = useState(false);

  const handleCloseError = () => {
    dispatch(clearCommentError());
  };

  return (
    <Fragment>
      <StyledHeader>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <StyledCommentIcon />
          <StyledTypography>{t("commentThreads")}</StyledTypography>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <StyledCommentButton onClick={() => setOpenCommentThread(true)}>
            {t("addComment")}
          </StyledCommentButton>
          <StyledIconContainer>
            <IconButton onClick={() => setOpen(false)} size="large">
              <StyledChevronRight />
            </IconButton>
          </StyledIconContainer>
        </div>
      </StyledHeader>
      <StyledPaper>
        <Grid container spacing={1} direction="column">
          {map(commentThreads, ({ id, status, comments }) => {
            const topComment = head(sortBy(comments, "createdDateTime"));
            return (
              <Grid key={id} size={12}>
                <Card>
                  <CardActionArea onClick={() => dispatch(onThreadReply(id))}>
                    <CardContent>
                      <CommentCard
                        comment={topComment}
                        status={status}
                        dispatch={dispatch}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </StyledPaper>
      <NewCommentThreadDialog
        dispatch={dispatch}
        open={openCommentThread}
        setOpen={setOpenCommentThread}
        newCommentText={newCommentText}
        onCommentChange={onCommentChange}
        subjectUUID={subjectUUID}
      />
      <Snackbar
        open={!!commentError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {t(commentError)}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};
