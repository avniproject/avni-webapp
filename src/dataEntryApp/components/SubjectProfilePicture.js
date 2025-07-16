import { useState, useEffect } from "react";
import { isEmpty, toLower } from "lodash";
import { useSelector } from "react-redux";
import { selectEnrolSubjectTypeFromName } from "../sagas/enrolmentSelectors";
import MediaService from "../../adminApp/service/MediaService";
import { Box, Dialog } from "@mui/material";
import CustomizedSnackbar from "./CustomizedSnackbar";

const SubjectProfilePicture = ({ allowEnlargementOnClick, firstName, profilePicture, subjectType, subjectTypeName, size, style }) => {
  if (subjectType == null) {
    subjectType = useSelector(selectEnrolSubjectTypeFromName(subjectTypeName));
  }
  const defaultIconUrl = `/icons/${toLower(subjectType.type)}.png`;
  const isProfilePictureAllowed = subjectType.allowProfilePicture;
  const isSubjectProfileIconSetup = isProfilePictureAllowed && !isEmpty(profilePicture);
  const label = isSubjectProfileIconSetup ? firstName : subjectTypeName;
  const [signedURL, setSignedURL] = useState();
  const [modalState, setModalState] = useState(false);
  const [errorLoadingProfileImage, setErrorLoadingProfileImage] = useState(false);

  const handleShowDialog = () => {
    allowEnlargementOnClick && setModalState(!modalState);
  };

  useEffect(() => {
    let urlToUse = isSubjectProfileIconSetup ? profilePicture : subjectType.iconFileS3Key;
    if (!isEmpty(urlToUse)) {
      MediaService.getMedia(urlToUse)
        .then(res => setSignedURL(res))
        .catch(() => setErrorLoadingProfileImage(true));
    }
  }, [isSubjectProfileIconSetup, subjectType]);

  const renderIcon = url => {
    return (
      <Box sx={{ display: "inline-block" }}>
        <CustomizedSnackbar
          defaultSnackbarStatus={errorLoadingProfileImage}
          message="Profile image URL is not correct or couldn't be loaded."
          onClose={() => setErrorLoadingProfileImage(false)}
        />
        <Box
          component="img"
          sx={{
            height: size,
            width: size,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: allowEnlargementOnClick ? "pointer" : "default",
            ...style
          }}
          onClick={handleShowDialog}
          src={url}
          alt={label}
        />
        {allowEnlargementOnClick && modalState && isSubjectProfileIconSetup && (
          <Dialog open={modalState} onClose={handleShowDialog} sx={{ "& .MuiDialog-paper": { maxWidth: "none" } }}>
            <Box
              component="img"
              sx={{
                height: 300,
                width: 300,
                borderRadius: "50%",
                objectFit: "cover",
                ...style
              }}
              onClick={handleShowDialog}
              src={url}
              alt={label}
            />
          </Dialog>
        )}
      </Box>
    );
  };

  return renderIcon(!isEmpty(signedURL) ? signedURL : defaultIconUrl);
};

export default SubjectProfilePicture;
