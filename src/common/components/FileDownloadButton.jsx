import { Link, IconButton } from "@mui/material";
import { CloudDownload } from "@mui/icons-material";
import { httpClient as http } from "common/utils/httpClient";

const FileDownloadButton = ({
  url,
  filename,
  disabled,
  buttonColor = "primary"
}) => {
  const DownloadButton = () => (
    <IconButton disabled={disabled} size="large">
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
