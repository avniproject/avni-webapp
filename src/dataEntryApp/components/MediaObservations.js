import React from "react";
import ReactImageVideoLightbox from "react-image-video-lightbox";

const MediaObservations = ({ mediaData, currentMediaItemIndex, onClose }) => {
  return (
    <ReactImageVideoLightbox
      data={mediaData}
      startIndex={currentMediaItemIndex}
      showResourceCount={true}
      onCloseCallback={() => onClose()}
    />
  );
};

export default MediaObservations;
