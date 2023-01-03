import React, { Fragment, useEffect } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import MaterialTable from "material-table";
import GlificService from "../../adminApp/service/GlificService";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { withRouter } from "react-router-dom";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { SearchForm } from "../../dataEntryApp/views/GlobalSearch/SearchFilterForm";
import {
  getGenders,
  getOperationalModules,
  getOrganisationConfig
} from "../reducers/metadataReducer";
import { useDispatch, connect } from "react-redux";
import Loading from "../../dataEntryApp/components/Loading";

const columns = [
  {
    title: "Name",
    sorting: false,
    field: "name"
  },
  {
    title: "Masked phone",
    sorting: false,
    field: "maskedPhone"
  }
];

const tableRef = React.createRef();

const fetchData = (query, contactGroupId, setGroupName) => {
  return new Promise(resolve =>
    GlificService.getContactGroupContacts(contactGroupId, query.page, query.pageSize).then(data => {
      setGroupName(data["group"]["label"]);
      resolve(data["contacts"]);
    })
  );
};

const WhatsAppContactGroup = ({ match, operationalModules, genders, organisationConfigs }) => {
  const [groupName, setGroupName] = React.useState("");
  const [addingSubjects, setAddingSubject] = React.useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrganisationConfig());
    dispatch(getGenders());
  }, []);

  if (!(genders && operationalModules && organisationConfigs)) return <Loading />;

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Contact Group"}>
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: 40 }}>
        <Link color="inherit" href={"/#/whatsApp"}>
          WhatsApp Groups
        </Link>
        <Typography component={"span"} color="textPrimary">
          {groupName}
        </Typography>
      </Breadcrumbs>
      {addingSubjects && (
        <SearchForm
          operationalModules={operationalModules}
          genders={genders}
          organisationConfigs={organisationConfigs}
          searchRequest={{}}
          onSearch={filterRequest => {}}
        />
      )}
      <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={1}
          onChange={() => {}}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Members" value={1} />
          <Tab label="Messages Sent" value={2} />
        </Tabs>

        <div className="container">
          <Box style={{ display: "flex", flexDirection: "row-reverse" }}>
            <Button
              color="primary"
              variant="outlined"
              style={{ marginLeft: 10 }}
              onClick={event => setAddingSubject(true)}
            >
              Add Subject
            </Button>
            <Button color="primary" variant="outlined" onClick={event => {}}>
              Add User
            </Button>
          </Box>
          <MaterialTable
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>
            }}
            tableRef={tableRef}
            columns={columns}
            data={query => fetchData(query, match.params["contactGroupId"], setGroupName)}
            options={{
              addRowPosition: "first",
              sorting: false,
              debounceInterval: 500,
              search: false,
              rowStyle: rowData => ({
                backgroundColor: "#fff"
              })
            }}
            actions={[]}
          />
        </div>
      </Box>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.broadcast.operationalModules,
  organisationConfigs: state.broadcast.organisationConfigs,
  genders: state.broadcast.genders
});

export default withRouter(connect(mapStateToProps)(WhatsAppContactGroup));
