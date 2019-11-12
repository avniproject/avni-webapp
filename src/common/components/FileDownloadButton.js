import React from "react";
import Link from "@material-ui/core/Link";
import CloudDownload from "@material-ui/icons/CloudDownload";
import { httpClient } from "../utils/httpClient";

const FileDownloadButton = ({ url, filename, iconProps }) => {
  return (
    <Link
      href={url}
      onClick={e => {
        e.preventDefault();
        httpClient.downloadFile(url, filename);
      }}
    >
      <CloudDownload {...iconProps} />
    </Link>
  );
};

export default FileDownloadButton;
