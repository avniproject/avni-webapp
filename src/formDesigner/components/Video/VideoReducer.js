export const VideoReducer = (video, action) => {
  switch (action.type) {
    case "name":
      return { ...video, title: action.payload };
    case "fileName":
      return { ...video, fileName: action.payload };
    case "duration":
      return {
        ...video,
        duration: action.payload === "" ? "" : +action.payload.replace(/\D/g, "")
      };
    case "description":
      return { ...video, description: action.payload };
    case "setData":
      console.log("calling setData");
      return {
        ...video,
        title: action.payload.title,
        fileName: action.payload.fileName,
        duration: action.payload.duration,
        description: action.payload.description
      };
    default:
      return video;
  }
};
