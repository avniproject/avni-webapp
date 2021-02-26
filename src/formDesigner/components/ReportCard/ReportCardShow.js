import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import FormLabel from "@material-ui/core/FormLabel";
import ColorValue from "../../common/ColorValue";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import ResourceShowView from "../../common/ResourceShowView";
import http from "../../../common/utils/httpClient";

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
        {!isStandardReportCard && (
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Query</FormLabel>
            <br />
            <Editor
              readOnly
              value={card.query ? card.query : ""}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 15,
                height: "auto",
                borderStyle: "solid",
                borderWidth: "1px"
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <ResourceShowView
      title={"Offline Report Card"}
      resourceId={props.match.params.id}
      resourceName={"card"}
      resourceURLName={"reportCard"}
      renderColumns={card => <RenderCard card={card} />}
    />
  );
};
