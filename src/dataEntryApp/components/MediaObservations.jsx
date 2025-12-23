import { useEffect } from "react";
import ReactImageVideoLightbox from "react-image-video-lightbox";

const MediaObservations = ({
  mediaDataList,
  currentMediaItemIndex,
  onClose,
  showResourceCount,
}) => {
  useEffect(() => {
    const lightboxContainer = document.querySelector(
      "div.mediaObservationContainer",
    );
    if (lightboxContainer?.firstChild) {
      lightboxContainer.firstChild.style.zIndex = "1200"; // appbar with 'fixed' position default z-index is 1100 so this needs to be greater than that
    }
  }, []);

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
