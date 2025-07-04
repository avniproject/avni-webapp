import { useState, useEffect } from "react";
import { isEmpty, toLower } from "lodash";
import MediaService from "../../adminApp/service/MediaService";

const SubjectTypeIcon = ({ subjectType, size, style }) => {
  const label = subjectType.name;
  const isIconSetup = !isEmpty(subjectType.iconFileS3Key);
  const [signedURL, setSignedURL] = useState();

  useEffect(() => {
    if (isIconSetup && isEmpty(signedURL)) {
      MediaService.getMedia(subjectType.iconFileS3Key).then(res => setSignedURL(res));
    }
  }, [subjectType.name]);

  const renderDefaultIcon = () => {
    const defaultIconFileName = `${toLower(subjectType.type)}.png`;
    return <img src={`/icons/${defaultIconFileName}`} height={size} width={size} alt={label} style={style} />;
  };

  const renderIcon = () => {
    return <img src={signedURL} height={size} width={size} alt={label} style={style} />;
  };

  return isIconSetup ? renderIcon() : renderDefaultIcon();
};

export default SubjectTypeIcon;
