import React from "react";
import ReactImageVideoLightbox from "react-image-video-lightbox";

const MediaObservations = ({ mediaDataList, currentMediaItemIndex, onClose }) => {
  React.useEffect(() => {
    const LightboxContainer = document.querySelector("div.mediaObservationContainer");
    LightboxContainer.firstChild.style.zIndex = 1;
  });

  return (
    <div className={"mediaObservationContainer"}>
      <ReactImageVideoLightbox
        data={mediaDataList}
        startIndex={currentMediaItemIndex}
        showResourceCount={true}
        onCloseCallback={() => onClose()}
      />
    </div>
  );
};

export default MediaObservations;
