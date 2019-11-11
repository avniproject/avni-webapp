import React from "react";
import Link from "@material-ui/core/Link";
import { httpClient } from "../utils/httpClient";
import { DownloadIcon } from "./utils";

const FileDownloadButton = ({ url, filename, iconStyle }) => {
  return (
    <Link
      href={url}
      onClick={e => {
        e.preventDefault();
        httpClient.downloadFile(url, filename);
      }}
    >
      <DownloadIcon style={iconStyle} />
    </Link>
  );
};

export default FileDownloadButton;
