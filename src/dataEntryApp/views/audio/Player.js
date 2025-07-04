import { replace } from "lodash";

//We play the audio this way when it is opened in the tab instead of passing S3 signed URL because there is codec
//issues in Firefox when audio is recorded from android(which doesn't support mp3 natively) and played in in the browser.

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    opacity: 0.8,
    height: "100vh"
  }
};

export default function Player({ history, ...props }) {
  const url = replace(props.location.search, "?url=", "");
  return (
    url && (
      <div style={styles.container}>
        <audio autoPlay style={{ width: "90%" }} preload="auto" controls="controls" src={url} />
      </div>
    )
  );
}
