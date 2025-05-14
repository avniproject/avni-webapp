import React from "react";
import Link from "@material-ui/core/Link";
import CloudDownload from "@material-ui/icons/CloudDownload";
import http from "common/utils/httpClient";
import IconButton from "@material-ui/core/IconButton";

const FileDownloadButton = ({ url, filename, disabled, buttonColor = "primary" }) => {
  const DownloadButton = () => (
    <IconButton disabled={disabled}>
      <CloudDownload color={buttonColor} />
    </IconButton>
  );

  return disabled ? (
    <DownloadButton />
  ) : (
    <Link
      href={url}
      onClick={e => {
        e.preventDefault();
        http.downloadFile(url, filename);
      }}
    >
      <DownloadButton />
    </Link>
  );
};

export default FileDownloadButton;
