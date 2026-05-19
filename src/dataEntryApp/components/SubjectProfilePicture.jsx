import { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { selectEnrolSubjectTypeFromName } from "../sagas/enrolmentSelectors";
import MediaService from "../../adminApp/service/MediaService";
import { Box, Dialog } from "@mui/material";
import CustomizedSnackbar from "./CustomizedSnackbar";
import {
  isProfilePictureEnabled,
  resolveDefaultIconUrl,
  resolveSubjectType,
} from "./SubjectProfilePictureUtil";

const SubjectProfilePicture = ({
  allowEnlargementOnClick,
  firstName,
  profilePicture,
  subjectType,
  subjectTypeName,
  size,
  style,
}) => {
  // Always call useSelector unconditionally to satisfy the Rules of Hooks.
  // Some call sites (e.g. SubjectSearchTable) pass subjectType={null} and rely
  // on the store lookup; others pass a hydrated SubjectType where the lookup
  // is effectively a no-op fallback.
  const subjectTypeFromStore = useSelector(
    selectEnrolSubjectTypeFromName(subjectTypeName),
  );
  const resolvedSubjectType = resolveSubjectType(
    subjectType,
    subjectTypeFromStore,
  );
  const defaultIconUrl = resolveDefaultIconUrl(resolvedSubjectType);
  const isSubjectProfileIconSetup =
    isProfilePictureEnabled(resolvedSubjectType) && !isEmpty(profilePicture);
  const label = isSubjectProfileIconSetup ? firstName : subjectTypeName;
  const [signedURL, setSignedURL] = useState();
  const [modalState, setModalState] = useState(false);
  const [errorLoadingProfileImage, setErrorLoadingProfileImage] =
    useState(false);

  const handleShowDialog = () => {
    allowEnlargementOnClick && setModalState(!modalState);
  };

  useEffect(() => {
    let urlToUse = isSubjectProfileIconSetup
      ? profilePicture
      : resolvedSubjectType && resolvedSubjectType.iconFileS3Key;
    if (!isEmpty(urlToUse)) {
      MediaService.getMedia(urlToUse)
        .then((res) => setSignedURL(res))
        .catch(() => setErrorLoadingProfileImage(true));
    }
  }, [isSubjectProfileIconSetup, resolvedSubjectType]);

  const renderIcon = (url) => {
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
            ...style,
          }}
          onClick={handleShowDialog}
          src={url}
          alt={label}
        />
        {allowEnlargementOnClick && modalState && isSubjectProfileIconSetup && (
          <Dialog
            open={modalState}
            onClose={handleShowDialog}
            sx={{ "& .MuiDialog-paper": { maxWidth: "none" } }}
          >
            <Box
              component="img"
              sx={{
                height: 300,
                width: 300,
                borderRadius: "50%",
                objectFit: "cover",
                ...style,
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
