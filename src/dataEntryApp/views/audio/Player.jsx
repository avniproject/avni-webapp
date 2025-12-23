import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

//We play the audio this way when it is opened in the tab instead of passing S3 signed URL because there is codec
//issues in Firefox when audio is recorded from android(which doesn't support mp3 natively) and played in in the browser.

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    opacity: 0.8,
    height: "100vh",
  },
};

export default function Player() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      setAudioUrl(decodedUrl);
    }
  }, [url]);

  if (!audioUrl) {
    return <div style={styles.container}>Loading audio...</div>;
  }

  return (
    <div style={styles.container}>
      <audio
        autoPlay
        style={{ width: "90%" }}
        preload="auto"
        controls
        src={audioUrl}
      />
    </div>
  );
}
