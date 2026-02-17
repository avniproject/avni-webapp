import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ValidationError } from "./ValidationError";
import { httpClient as http } from "../../common/utils/httpClient";
import { find, get } from "lodash";
// eslint-disable-next-line import/no-named-as-default
import SignatureCanvas from "react-signature-canvas";

const SignatureContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2)
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1)
}));

const SignatureImage = styled("img")(({ theme }) => ({
  maxWidth: "100%",
  maxHeight: "200px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius
}));

const StyledSignatureCanvas = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#fff",
  width: "100%",
  height: "200px"
}));

export default function SignatureFormElement({
  formElement,
  value,
  update,
  validationResults,
  uuid
}) {
  const { t } = useTranslation();
  const { mandatory, name } = formElement;
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid && questionGroupIndex === 0
  );
  const signatureRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [existingSignature, setExistingSignature] = useState(null);

  useEffect(() => {
    if (value) {
      setHasSignature(true);
      setExistingSignature(value);
    } else {
      setExistingSignature(null);
    }
  }, [value]);

  const clearCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setHasSignature(false);
    setExistingSignature(null);
    update(null);
  };

  const saveSignature = () => {
    if (!signatureRef.current) return;

    if (signatureRef.current.isEmpty()) {
      alert("Please draw a signature before saving");
      return;
    }

    setIsUploading(true);

    const signatureData = signatureRef.current.getDataURL();

    fetch(signatureData)
      .then(res => res.blob())
      .then(blob => {
        const file = Object.assign(blob, {
          name: "signature.png",
          type: "image/png"
        });

        http
          .uploadFile("/web/uploadMedia", file)
          .then(response => {
            setIsUploading(false);
            setHasSignature(true);
            setExistingSignature(response.data);
            update(response.data);
          })
          .catch(error => {
            setIsUploading(false);
            const errorMessage =
              get(error, "response.data") ||
              get(error, "message") ||
              "Failed to upload signature";
            alert(errorMessage);
          });
      })
      .catch(() => {
        setIsUploading(false);
        alert("Failed to process signature");
      });
  };

  const handleBegin = () => {
    setHasSignature(true);
  };

  const handleEnd = () => {};

  return (
    <SignatureContainer>
      <Typography variant="subtitle1" color="textSecondary">
        {t(name)} {mandatory && "*"}
      </Typography>

      {existingSignature ? (
        <Paper elevation={1} sx={{ p: 2 }}>
          <SignatureImage src={existingSignature} alt="Signature" />
          <ButtonContainer sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={clearCanvas}
              disabled={isUploading}
            >
              {t("Clear")}
            </Button>
          </ButtonContainer>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ p: 2 }}>
          <StyledSignatureCanvas>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: "100%",
                height: "200px",
                className: "signature-canvas"
              }}
              onBegin={handleBegin}
              onEnd={handleEnd}
            />
          </StyledSignatureCanvas>

          <ButtonContainer sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={clearCanvas}
              disabled={isUploading}
            >
              {t("Clear")}
            </Button>
            <Button
              variant="contained"
              onClick={saveSignature}
              disabled={isUploading || !hasSignature}
            >
              {isUploading ? t("Uploading...") : t("Save Signature")}
            </Button>
          </ButtonContainer>
        </Paper>
      )}

      {validationResult && (
        <ValidationError validationResult={validationResult} />
      )}
    </SignatureContainer>
  );
}
