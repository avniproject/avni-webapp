import React from "react";
import { isEmpty, toLower } from "lodash";
import { useSelector } from "react-redux";
import { selectEnrolSubjectTypeFromName } from "../sagas/enrolmentSelectors";
import http from "../../common/utils/httpClient";

const SubjectTypeIcon = ({ subjectTypeName, size, style }) => {
  if (isEmpty(subjectTypeName)) return null;
  const subjectType = useSelector(selectEnrolSubjectTypeFromName(subjectTypeName));
  const label = subjectType.name;
  const isIconSetup = !isEmpty(subjectType.iconFileS3Key);
  const [signedURL, setSignedURL] = React.useState();

  React.useEffect(() => {
    if (isIconSetup && isEmpty(signedURL)) {
      http
        .get(http.withParams(`/media/signedUrl`, { url: subjectType.iconFileS3Key }))
        .then(res => res.data)
        .then(res => setSignedURL(res));
    }
  }, [subjectTypeName]);

  const renderDefaultIcon = () => {
    const defaultIconFileName = `${toLower(subjectType.type)}.png`;
    return (
      <img
        src={`/icons/${defaultIconFileName}`}
        height={size}
        width={size}
        alt={label}
        style={style}
      />
    );
  };

  const renderIcon = () => {
    return <img src={signedURL} height={size} width={size} alt={label} style={style} />;
  };

  return isIconSetup ? renderIcon() : renderDefaultIcon();
};

export default SubjectTypeIcon;
