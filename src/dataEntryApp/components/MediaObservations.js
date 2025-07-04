import { useEffect } from "react";
import ReactImageVideoLightbox from "react-image-video-lightbox";

const MediaObservations = ({ mediaDataList, currentMediaItemIndex, onClose, showResourceCount }) => {
  useEffect(() => {
    const LightboxContainer = document.querySelector("div.mediaObservationContainer");
    LightboxContainer.firstChild.style.zIndex = 2;
  });

  return (
    <div className={"mediaObservationContainer"}>
      <ReactImageVideoLightbox
        data={mediaDataList}
        startIndex={currentMediaItemIndex}
        showResourceCount={showResourceCount}
        onCloseCallback={() => onClose()}
      />
    </div>
  );
};

export default MediaObservations;
