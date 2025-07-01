import React, { Fragment } from "react";
import { Box, Typography, Button, Divider, GridLegacy as Grid } from "@mui/material";
import { getFormattedDateTime } from "../../adminApp/components/AuditUtil";
import { Delete, Edit } from "@mui/icons-material";
import { ActionButton } from "./ActionButton";
import { isNil } from "lodash";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import DOMPurify from "dompurify";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const NewsDetailsCard = ({ history, news, setDeleteAlert, setOpenEdit, setPublishAlert, displayActions, userInfo }) => {
  const canEditNews = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditNews);

  return (
    <Fragment>
      <Grid
        container
        direction="row"
        sx={{
          alignItems: "center"
        }}
      >
        <Grid item container xs={6} direction={"column"}>
          <Grid item>
            <Button color="primary" onClick={history.goBack} style={{ textTransform: "none", backgroundColor: "transparent" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {"< Back"}
              </Typography>
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {news.title}
            </Typography>
          </Grid>
          <Grid item>
            <Typography sx={{ opacity: 0.7 }} variant="body2">
              {getFormattedDateTime(news.createdDateTime)}
            </Typography>
          </Grid>
        </Grid>
        {displayActions && canEditNews && (
          <Grid
            item
            container
            spacing={2}
            xs={6}
            sx={{
              justifyContent: "flex-end"
            }}
          >
            <Grid item>
              <Button style={{ color: "red" }} onClick={() => setDeleteAlert(true)}>
                <Delete /> Delete
              </Button>
            </Grid>
            <Grid item>
              <Button color="primary" type="button" onClick={() => setOpenEdit(true)}>
                <Edit />
                Edit
              </Button>
            </Grid>
            <Grid item>
              <ActionButton
                disabled={!isNil(news.publishedDate)}
                onClick={() => setPublishAlert(true)}
                variant="contained"
                style={{ paddingHorizontal: 10 }}
                size="medium"
              >
                {"Publish this news"}
              </ActionButton>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Box
        sx={{
          mt: 2
        }}
      />
      <Divider />
      <Box
        sx={{
          mt: 2
        }}
      />
      <Grid container spacing={5} direction="column">
        <Grid item align={"center"}>
          <AvniImageUpload oldImgUrl={news.heroImage} height={"400"} width={"80%"} />
        </Grid>
        <Grid
          item
          container
          sx={{
            justifyContent: "flex-start"
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.contentHtml) }} />
        </Grid>
      </Grid>
    </Fragment>
  );
};
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default connect(mapStateToProps)(NewsDetailsCard);
