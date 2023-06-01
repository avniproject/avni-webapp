import UploadTypes from "./UploadTypes";

const typesForStaticDownload = Object.freeze({
  locations: { name: "Locations" },
  metadataZip: { name: "Metadata Zip" }
});

const typesForDynamicDownload = Object.freeze({
  usersAndCatchments: { name: "Users & Catchments" }
});

let staticTypesWithStaticDownload = new UploadTypes(typesForStaticDownload),
  staticTypesWithDynamicDownload = new UploadTypes(typesForDynamicDownload);

export { staticTypesWithStaticDownload, staticTypesWithDynamicDownload };
