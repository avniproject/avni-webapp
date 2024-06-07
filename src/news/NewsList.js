import React, { Fragment } from "react";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import API from "./api";
import MaterialTable from "material-table";
import { getFormattedDateTime } from "../adminApp/components/AuditUtil";
import { isNil, orderBy } from "lodash";
import { Paper } from "@material-ui/core";
import { CustomToolbar } from "./components/CustomToolbar";
import { CreateEditNews } from "./CreateEditNews";
import UserInfo from "../common/model/UserInfo";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import materialTableIcons from "../common/material-table/MaterialTableIcons";

function NewsList({ userInfo }) {
  const [news, setNews] = React.useState([]);
  const [openCreate, setOpenCreate] = React.useState(false);
  const tableRef = React.createRef();

  React.useEffect(() => {
    API.getNews().then(news => setNews(orderBy(news, "lastModifiedDateTime", "desc")));
  }, [openCreate]);

  const columns = [
    {
      title: "Title",
      field: "title"
    },
    {
      title: "Created On",
      field: "createdDateTime",
      render: rowData => getFormattedDateTime(rowData.createdDateTime)
    },
    {
      title: "Modified On",
      field: "lastModifiedDateTime",
      render: rowData => getFormattedDateTime(rowData.lastModifiedDateTime)
    },
    {
      title: "Published On",
      field: "publishedDate",
      render: rowData => (isNil(rowData.publishedDate) ? "-" : getFormattedDateTime(rowData.publishedDate))
    },
    {
      title: "Action",
      render: rowData => <a href={`#/broadcast/news/${rowData.id}/details`}>{"See details"}</a>
    }
  ];

  const canEditNews = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditNews);

  return (
    <ScreenWithAppBar appbarTitle={"News Broadcast"}>
      <DocumentationContainer filename={"NewsBroadcast.md"}>
        <Paper style={{ marginBottom: "15px", marginTop: "15px" }}>
          <MaterialTable
            icons={materialTableIcons}
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>,
              Toolbar: props => canEditNews && <CustomToolbar setOpenCreate={setOpenCreate} totalNews={news.length} {...props} />
            }}
            tableRef={tableRef}
            columns={columns}
            data={news}
            options={{
              pageSize: 10,
              addRowPosition: "first",
              sorting: true,
              debounceInterval: 500,
              search: false,
              headerStyle: {
                zIndex: 1,
                color: "rgb(68, 68, 68)",
                fontWeight: "bold"
              },
              rowStyle: {
                color: "rgb(68, 68, 68)",
                opacity: ".9"
              }
            }}
          />
        </Paper>
        <CreateEditNews open={openCreate} headerTitle={"Add news broadcast"} handleClose={() => setOpenCreate(false)} edit={false} />
      </DocumentationContainer>
    </ScreenWithAppBar>
  );
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(NewsList);
