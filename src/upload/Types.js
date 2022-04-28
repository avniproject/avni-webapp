import UploadTypes from "./UploadTypes";

const types = Object.freeze({
  locations: { name: "Locations" },
  usersAndCatchments: { name: "Users & Catchments" },
  metadataZip: { name: "Metadata Zip" }
});

export default new UploadTypes(types);
