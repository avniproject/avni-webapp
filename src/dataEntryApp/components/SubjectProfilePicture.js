import React from "react";
import { isEmpty, toLower } from "lodash";
import http from "../../common/utils/httpClient";
import { useSelector } from "react-redux";
import { selectEnrolSubjectTypeFromName } from "../sagas/enrolmentSelectors";

const SubjectProfilePicture = ({
  firstName,
  profilePicture,
  subjectType,
  subjectTypeName,
  size,
  style
}) => {
  if (subjectType == null) {
    subjectType = useSelector(selectEnrolSubjectTypeFromName(subjectTypeName));
  }
  const defaultIconUrl = `/icons/${toLower(subjectType.type)}.png`;
  const isProfilePictureAllowed = subjectType.allowProfilePicture;
  const isSubjectProfileIconSetup = isProfilePictureAllowed && !isEmpty(profilePicture);
  const label = isSubjectProfileIconSetup ? firstName : subjectTypeName;
  const [signedURL, setSignedURL] = React.useState();
  const [modalState, setModalState] = React.useState(false);

  const handleShowDialog = () => {
    setModalState(!modalState);
    console.log("clicked");
  };

  React.useEffect(() => {
    let urlToUse = isSubjectProfileIconSetup ? profilePicture : subjectType.iconFileS3Key;
    if (!isEmpty(urlToUse)) {
      http
        .get(http.withParams(`/media/signedUrl`, { url: urlToUse }))
        .then(res => res.data)
        .then(res => setSignedURL(res));
    }
  }, [isSubjectProfileIconSetup, subjectType]);

  const renderIcon = url => {
    return (
      <div>
        <img
          className="circular_image"
          onClick={handleShowDialog}
          src={url}
          height={size}
          width={size}
          alt={label}
          style={style}
        />
        {modalState && isSubjectProfileIconSetup && (
          <dialog className="modal_dialog" open onClick={handleShowDialog}>
            <img
              onClick={handleShowDialog}
              src={url}
              height={300}
              width={300}
              alt={label}
              style={style}
            />
          </dialog>
        )}
      </div>
    );
  };

  return renderIcon(!isEmpty(signedURL) ? signedURL : defaultIconUrl);
};

export default SubjectProfilePicture;
