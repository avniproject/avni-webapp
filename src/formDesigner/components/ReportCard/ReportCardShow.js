import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import FormLabel from "@material-ui/core/FormLabel";
import ColorValue from "../../common/ColorValue";
import ResourceShowView from "../../common/ResourceShowView";
import http from "../../../common/utils/httpClient";
import RuleDisplay from "../../../adminApp/components/RuleDisplay";

export const ReportCardShow = props => {
  const RenderCard = ({ card, ...props }) => {
    const [standardReportCardType, setStandardReportCardType] = React.useState();
    const [isStandardReportCard, setIsStandardReportCard] = React.useState(false);
    const [iconPreviewUrl, setIconPreviewUrl] = React.useState("");

    React.useEffect(() => {
      if (card.standardReportCardTypeId != null) {
        http
          .get(`/web/standardReportCardType/${card.standardReportCardTypeId}`)
          .then(res => res.data)
          .then(res => {
            setStandardReportCardType({ name: res.name, id: res.id });
            setIsStandardReportCard(true);
          });
      }
    }, [card.standardReportCardTypeId]);

    React.useEffect(() => {
      if (card.iconFileS3Key != null) {
        http
          .get(http.withParams(`/media/signedUrl`, { url: card.iconFileS3Key }))
          .then(res => res.data)
          .then(res => {
            setIconPreviewUrl(res);
          });
      }
    }, [card.iconFileS3Key]);

    return (
      <div>
        <ShowLabelValue label={"Name"} value={card.name} />
        <p />
        <ShowLabelValue label={"Description"} value={card.description} />
        <p />
        <div>
          <FormLabel style={{ fontSize: "13px" }}>{"Colour"}</FormLabel>
          <br />
          <ColorValue colour={card.color} />
        </div>
        <p />
        <div>
          <FormLabel style={{ fontSize: "13px" }}>{"Icon"}</FormLabel>
          <br />
          <img src={iconPreviewUrl} alt="Icon Preview" />
        </div>
        <p />
        {isStandardReportCard && (
          <React.Fragment>
            <ShowLabelValue
              label={"Standard Report Card Type"}
              value={standardReportCardType.name}
            />
            <p />
          </React.Fragment>
        )}
        {!isStandardReportCard && <RuleDisplay fieldLabel={"Query"} ruleText={card.query} />}
      </div>
    );
  };

  return (
    <ResourceShowView
      title={"Offline Report Card"}
      resourceId={props.match.params.id}
      resourceName={"card"}
      resourceURLName={"reportCard"}
      render={card => <RenderCard card={card} />}
    />
  );
};
