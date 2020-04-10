import UploadTypes from "./UploadTypes";

const types = Object.freeze({
  locations: "Locations",
  usersAndCatchments: "Users & Catchments",
  metadataZip: "Metadata Zip"
});

export default new UploadTypes(types);
