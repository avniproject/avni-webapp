import { httpClient as http } from "../utils/httpClient";

const FormShareTemplateService = {
  upload(formUuid, file) {
    return http.uploadFile(`/web/form/${formUuid}/uploadShareTemplate`, file);
  },
  fileUrl(s3Key) {
    return `/formShareTemplateFile/${s3Key}`;
  },
};

export default FormShareTemplateService;
