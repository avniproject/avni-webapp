import UploadTypes from "./UploadTypes";

const typesForStaticDownload = Object.freeze({
  metadataZip: { name: "Metadata Zip" }
});

const typesForDynamicDownload = Object.freeze({
  locations: { name: "Locations" },
  usersAndCatchments: { name: "Users & Catchments" }
});

let staticTypesWithStaticDownload = new UploadTypes(typesForStaticDownload),
  staticTypesWithDynamicDownload = new UploadTypes(typesForDynamicDownload);

export { staticTypesWithStaticDownload, staticTypesWithDynamicDownload };
