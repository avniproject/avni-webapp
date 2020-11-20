import React from "react";
import ReactImageVideoLightbox from "react-image-video-lightbox";

const MediaObservations = ({ mediaData, currentMediaItemIndex, onClose }) => {
  React.useEffect(() => {
    const LightboxContainer = document.querySelector("div.mediaObservationContainer");
    LightboxContainer.firstChild.style.zIndex = 1;
  });

  return (
    <div className={"mediaObservationContainer"}>
      <ReactImageVideoLightbox
        data={mediaData}
        startIndex={currentMediaItemIndex}
        showResourceCount={true}
        onCloseCallback={() => onClose()}
      />
    </div>
  );
};

export default MediaObservations;
