import { ShowLabelValue } from "../../common/ShowLabelValue";
import { FormLabel } from "@mui/material";
import ResourceShowView from "../../common/ResourceShowView";
import RuleDisplay from "../../../adminApp/components/RuleDisplay";
import { useSelector } from "react-redux";
import { Privilege } from "openchs-models";
import { useParams } from "react-router-dom";
import { httpClient as http } from "../../../common/utils/httpClient";

function RenderConfig({ config }) {
  if (!config) return null;

  const downloadHtmlFile = () => {
    http.downloadFile(
      `/customCardConfigFile/${config.htmlFileS3Key}`,
      config.htmlFileS3Key,
    );
  };

  return (
    <div>
      <ShowLabelValue label={"Name"} value={config.name} />
      <p />
      <FormLabel style={{ fontSize: "13px" }}>HTML File</FormLabel>
      <br />
      {config.htmlFileS3Key ? (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            downloadHtmlFile();
          }}
        >
          {config.htmlFileS3Key}
        </a>
      ) : (
        "-"
      )}
      <p />
      <RuleDisplay fieldLabel="Data Rule" ruleText={config.dataRule} />
    </div>
  );
}

const CustomCardConfigShow = () => {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.app.userInfo);

  return (
    <ResourceShowView
      title="Custom Card Config"
      resourceId={id}
      resourceName={"customCardConfig"}
      resourceURLName={"customCardConfig"}
      render={(config) => <RenderConfig config={config} />}
      editPrivilegeType={
        Privilege.PrivilegeType.EditOfflineDashboardAndReportCard
      }
      userInfo={userInfo}
      mapResource={(resource) => resource}
      defaultResource={{}}
    />
  );
};

export default CustomCardConfigShow;
