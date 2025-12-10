import axios from "axios";
import { debounce } from "lodash";

// Create dedicated axios instance for Dify API to bypass global interceptors
const difyAxios = axios.create();

class DifyFormValidationService {
  constructor() {
    this.apiKey = null;
    // Use Vite proxy in development, direct API URL in production
    // In dev mode, Vite proxies /dify-api to https://api.dify.ai to avoid CORS
    this.baseUrl = import.meta.env.DEV ? "/dify-api/v1" : "https://api.dify.ai/v1";
    // Maintain separate conversation IDs for each request type
    this.conversationIds = {};
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  getApiKey() {
    return this.apiKey;
  }

  formatQuestionForDify(formElement, formType = "", formContext = {}, requestType = "FormValidation") {
    try {
      if (requestType === "VisitSchedule") {
        return this.formatVisitScheduleQuestion(formElement);
      }

      // Defensive: ensure formElement exists
      if (!formElement) {
        return "Question Text: Unknown\nOptions: None\nContext: No context available\n\nPlease validate this form element.";
      }

      // Default FormValidation logic with defensive checks
      let options = "None";
      try {
        options =
          formElement.concept?.answers?.length > 0
            ? formElement.concept.answers.map((answer) => answer?.name || "Unknown").join(", ")
            : "None";
      } catch {
        options = "None";
      }

      // Build enhanced context string with defensive checks
      const contextParts = [];

      try {
        // Add current field configuration
        if (formElement.concept) {
          contextParts.push(`Current dataType: ${formElement.concept.dataType || "Unknown"}`);
          contextParts.push(`Current type: ${formElement.type || "Unknown"}`);
          if (formElement.mandatory != null) {
            contextParts.push(`Mandatory: ${formElement.mandatory}`);
          }

          const dataType = formElement.concept.dataType;

          // Add numeric bounds info if available
          if (dataType === "Numeric") {
            try {
              const bounds = [];
              if (formElement.concept.lowAbsolute != null) bounds.push(`lowAbsolute: ${formElement.concept.lowAbsolute}`);
              if (formElement.concept.highAbsolute != null) bounds.push(`highAbsolute: ${formElement.concept.highAbsolute}`);
              if (formElement.concept.lowNormal != null) bounds.push(`lowNormal: ${formElement.concept.lowNormal}`);
              if (formElement.concept.highNormal != null) bounds.push(`highNormal: ${formElement.concept.highNormal}`);
              if (formElement.concept.unit) bounds.push(`unit: ${formElement.concept.unit}`);
              if (bounds.length > 0) {
                contextParts.push(`Numeric bounds: ${bounds.join(", ")}`);
              }
            } catch {
              // Silently ignore numeric bounds errors
            }
          }

          // Add duration options if available
          if (dataType === "Duration") {
            try {
              if (formElement.keyValues?.durationOptions?.length > 0) {
                contextParts.push(`Duration options: ${formElement.keyValues.durationOptions.join(", ")}`);
              }
            } catch {
              // Silently ignore duration errors
            }
          }

          // Add date/time picker mode if available
          if (dataType === "Date" || dataType === "DateTime") {
            try {
              const dateConfig = [];
              if (formElement.keyValues?.datePickerMode) dateConfig.push(`datePickerMode: ${formElement.keyValues.datePickerMode}`);
              if (formElement.keyValues?.timePickerMode) dateConfig.push(`timePickerMode: ${formElement.keyValues.timePickerMode}`);
              if (dateConfig.length > 0) {
                contextParts.push(`Date config: ${dateConfig.join(", ")}`);
              }
            } catch {
              // Silently ignore date config errors
            }
          }

          // Add location config if available
          if (dataType === "Location") {
            try {
              const locationConfig = [];
              if (formElement.keyValues?.isWithinCatchment != null) {
                locationConfig.push(`isWithinCatchment: ${formElement.keyValues.isWithinCatchment}`);
              }
              if (formElement.keyValues?.lowestAddressLevelTypeUUIDs?.length > 0) {
                locationConfig.push(`lowestAddressLevelTypes: configured`);
              }
              if (formElement.keyValues?.highestAddressLevelTypeUUID) {
                locationConfig.push(`highestAddressLevelType: configured`);
              }
              if (locationConfig.length > 0) {
                contextParts.push(`Location config: ${locationConfig.join(", ")}`);
              }
            } catch {
              // Silently ignore location config errors
            }
          }

          // Add subject type config if available
          if (dataType === "Subject") {
            try {
              const subjectConfig = [];
              if (formElement.keyValues?.subjectTypeUUID) subjectConfig.push(`subjectType: configured`);
              if (formElement.keyValues?.groupSubjectTypeUUID) subjectConfig.push(`groupSubjectType: configured`);
              if (formElement.keyValues?.groupSubjectRoleUUID) subjectConfig.push(`groupSubjectRole: configured`);
              if (subjectConfig.length > 0) {
                contextParts.push(`Subject config: ${subjectConfig.join(", ")}`);
              }
            } catch {
              // Silently ignore subject config errors
            }
          }

          // Add encounter config if available
          if (dataType === "Encounter") {
            try {
              const encounterConfig = [];
              if (formElement.keyValues?.encounterTypeUUID) encounterConfig.push(`encounterType: configured`);
              if (formElement.keyValues?.encounterScope) encounterConfig.push(`encounterScope: ${formElement.keyValues.encounterScope}`);
              if (formElement.keyValues?.encounterIdentifier)
                encounterConfig.push(`encounterIdentifier: ${formElement.keyValues.encounterIdentifier}`);
              if (encounterConfig.length > 0) {
                contextParts.push(`Encounter config: ${encounterConfig.join(", ")}`);
              }
            } catch {
              // Silently ignore encounter config errors
            }
          }

          // Add phone number config if available
          if (dataType === "PhoneNumber") {
            try {
              if (formElement.keyValues?.verifyPhoneNumber != null) {
                contextParts.push(`Phone config: verifyPhoneNumber: ${formElement.keyValues.verifyPhoneNumber}`);
              }
            } catch {
              // Silently ignore phone config errors
            }
          }

          // Add Id config if available
          if (dataType === "Id") {
            try {
              const idConfig = [];
              if (formElement.keyValues?.IdSourceUUID) idConfig.push(`idSource: configured`);
              if (formElement.keyValues?.unique != null) idConfig.push(`unique: ${formElement.keyValues.unique}`);
              if (formElement.keyValues?.editable != null) idConfig.push(`editable: ${formElement.keyValues.editable}`);
              if (idConfig.length > 0) {
                contextParts.push(`Id config: ${idConfig.join(", ")}`);
              }
            } catch {
              // Silently ignore id config errors
            }
          }

          // Add file/image/video/audio constraints if available
          if (["Image", "Video", "Audio", "File"].includes(dataType)) {
            try {
              const fileConfig = [];
              if (formElement.keyValues?.maxHeight) fileConfig.push(`maxHeight: ${formElement.keyValues.maxHeight}`);
              if (formElement.keyValues?.maxWidth) fileConfig.push(`maxWidth: ${formElement.keyValues.maxWidth}`);
              if (formElement.keyValues?.imageQuality) fileConfig.push(`imageQuality: ${formElement.keyValues.imageQuality}`);
              if (formElement.keyValues?.videoQuality) fileConfig.push(`videoQuality: ${formElement.keyValues.videoQuality}`);
              if (formElement.keyValues?.durationLimitInSecs)
                fileConfig.push(`durationLimitInSecs: ${formElement.keyValues.durationLimitInSecs}`);
              if (fileConfig.length > 0) {
                contextParts.push(`File config: ${fileConfig.join(", ")}`);
              }
            } catch {
              // Silently ignore file config errors
            }
          }

          // Add text validation format if available
          if (dataType === "Text") {
            try {
              if (formElement.validFormat) {
                const textConfig = [];
                if (formElement.validFormat.regex) textConfig.push(`regex: ${formElement.validFormat.regex}`);
                if (formElement.validFormat.descriptionKey) textConfig.push(`description: ${formElement.validFormat.descriptionKey}`);
                if (textConfig.length > 0) {
                  contextParts.push(`Text validation: ${textConfig.join(", ")}`);
                }
              }
            } catch {
              // Silently ignore text validation errors
            }
          }

          // Add QuestionGroup config if available
          if (dataType === "QuestionGroup") {
            try {
              if (formElement.keyValues?.repeatable != null) {
                contextParts.push(`QuestionGroup config: repeatable: ${formElement.keyValues.repeatable}`);
              }
            } catch {
              // Silently ignore question group config errors
            }
          }

          // Add coded concept answer details if available
          if (dataType === "Coded") {
            try {
              if (formElement.concept.answers?.length > 0) {
                const uniqueAnswers = formElement.concept.answers.filter((a) => a?.unique).map((a) => a?.name || "Unknown");
                const abnormalAnswers = formElement.concept.answers.filter((a) => a?.abnormal).map((a) => a?.name || "Unknown");
                const excludedAnswers = formElement.concept.answers.filter((a) => a?.excluded).map((a) => a?.name || "Unknown");
                if (uniqueAnswers.length > 0) {
                  contextParts.push(`Unique answers: ${uniqueAnswers.join(", ")}`);
                }
                if (abnormalAnswers.length > 0) {
                  contextParts.push(`Abnormal answers: ${abnormalAnswers.join(", ")}`);
                }
                if (excludedAnswers.length > 0) {
                  contextParts.push(`Excluded answers: ${excludedAnswers.join(", ")}`);
                }
              }
            } catch {
              // Silently ignore coded answer errors
            }
          }
        }
      } catch {
        // Silently ignore concept-level errors
      }

      // Add form context with defensive checks
      try {
        if (formType) {
          contextParts.push(`Form type: ${formType}`);
        }

        if (formContext?.domain) {
          contextParts.push(`Domain: ${formContext.domain}`);
        }

        if (formContext?.subjectTypeType) {
          contextParts.push(`Subject type: ${formContext.subjectTypeType}`);
        }
      } catch {
        // Silently ignore form context errors
      }

      const contextString = contextParts.length > 0 ? contextParts.join(" | ") : "No specific context provided";

      return `Question Text: ${formElement.name || "Unknown"}
Options: ${options}
Context: ${contextString}

Please validate this form element according to Avni rules and provide recommendations.`;
    } catch (error) {
      // Ultimate fallback - return minimal valid prompt
      console.warn("formatQuestionForDify failed, using fallback:", error);
      return `Question Text: ${formElement?.name || "Unknown"}
Options: None
Context: No context available

Please validate this form element.`;
    }
  }

  formatVisitScheduleQuestion(formElement) {
    try {
      return `${formElement?.requirements || "Requirements not specified"}`;
    } catch {
      return "Requirements not specified";
    }
  }

  async validateSingleFormElement(formElement, formType = "", _formContext = {}, requestType = "FormValidation") {
    if (!this.apiKey) {
      console.warn("Dify API key not configured");
      return [];
    }

    try {
      const question = this.formatQuestionForDify(formElement, formType, _formContext, requestType);

      // Prepare inputs object for VisitSchedule requests
      const inputs =
        requestType === "VisitSchedule"
          ? {
              auth_token: null,
              org_name: null,
              org_type: "trial",
              user_name: null,
              avni_mcp_server_url: "https://staging-mcp.avniproject.org",
              requestType: "VisitSchedule",
              form_context: JSON.stringify(formElement.form_context || {}),
            }
          : {};

      const payload = {
        inputs,
        query: question,
        response_mode: "blocking",
        user: "avni-form-designer",
      };
      // Only add conversation_id if it has a value (Dify expects omission for new conversations)
      if (this.conversationIds[requestType]) {
        payload.conversation_id = this.conversationIds[requestType];
      }

      const response = await difyAxios.post(`${this.baseUrl}/chat-messages`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        withCredentials: false,
        timeout: requestType === "VisitSchedule" ? 30000 : 10000, // 30s for VisitSchedule, 10s for FormValidation
      });

      const validationResults = this.parseDifyResponse(response, requestType);
      return validationResults;
    } catch (error) {
      console.warn("Dify validation API call failed (non-critical):", error?.message || error);
      return [];
    }
  }

  async validateBatchFormElements(formElements, formType) {
    // Defensive: ensure formElements is a valid array
    const safeFormElements = Array.isArray(formElements) ? formElements : [];

    if (!this.apiKey) {
      console.warn("Dify API key not configured");
      return safeFormElements.map(() => []);
    }

    if (safeFormElements.length === 0) {
      return [];
    }

    const questions = safeFormElements.map((formElement) => this.formatQuestionForDify(formElement, formType || ""));

    try {
      const batchQuestion = questions.join("\n\n---\n\n");

      const response = await difyAxios.post(
        `${this.baseUrl}/chat-messages`,
        {
          inputs: {},
          query: batchQuestion,
          response_mode: "blocking",
          user: "avni-form-designer",
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          withCredentials: false,
          timeout: 30000, // 30 second timeout for batch
        },
      );

      return this.parseBatchDifyResponse(response.data, safeFormElements.length);
    } catch (error) {
      console.warn("Dify batch validation API call failed (non-critical):", error?.message || error);
      return safeFormElements.map(() => []);
    }
  }

  parseDifyResponse(response, requestType = "FormValidation") {
    try {
      const answer = response.data?.answer || "";
      const conversationId = response.data?.conversation_id || "";

      if (conversationId) {
        this.conversationIds[requestType] = conversationId;
      }

      if (answer) {
        // For VisitSchedule, detect if it's scenarios or code
        if (requestType === "VisitSchedule") {
          // Check if response contains JavaScript code (function signature)
          const hasJavaScriptCode =
            answer.includes('"use strict";') ||
            answer.includes("({params, imports}) =>") ||
            answer.includes("```javascript") ||
            answer.includes("```js");

          if (hasJavaScriptCode) {
            // This is final code - extract and return it
            let cleanCode = answer.trim();
            const codeBlockMatch = cleanCode.match(/```(?:javascript|js)?\s*\n?([\s\S]*?)\n?```/i);
            if (codeBlockMatch) {
              cleanCode = codeBlockMatch[1].trim();
            }

            return {
              type: "code",
              content: cleanCode,
              conversationId,
            };
          } else {
            // This is scenarios text - return as-is
            return {
              type: "scenarios",
              content: answer.trim(),
              conversationId,
            };
          }
        }

        // For FormValidation, parse as JSON (existing behavior)
        let cleanAnswer = answer.trim();
        const codeBlockMatch = cleanAnswer.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
        if (codeBlockMatch) {
          cleanAnswer = codeBlockMatch[1].trim();
        }

        try {
          const parsed = JSON.parse(cleanAnswer);
          // Handle new response format with "issues" wrapper
          if (parsed.issues && Array.isArray(parsed.issues)) {
            return parsed.issues;
          }

          if (parsed.Issues && Array.isArray(parsed.Issues)) {
            return parsed.Issues;
          }
          // Handle old format (direct array)
          return Array.isArray(parsed) ? parsed : parsed;
        } catch {
          return this.extractValidationFromText(answer);
        }
      }

      return [];
    } catch (error) {
      console.warn("Failed to parse Dify response (non-critical):", error?.message || error);
      return [];
    }
  }

  extractValidationFromText(text) {
    try {
      // Defensive: ensure text is a string
      if (!text || typeof text !== "string") {
        return [];
      }

      // Extract validation messages from plain text response
      const lines = text.split("\n").filter((line) => line && line.trim());
      const validations = [];

      lines.forEach((line) => {
        try {
          if (line.includes("CRITICAL:") || line.includes("HIGH:") || line.includes("MEDIUM:") || line.includes("LOW:")) {
            validations.push({
              formElementUuid: null,
              formElementName: "Unknown",
              message: line.trim(),
            });
          }
        } catch {
          // Silently ignore individual line parsing errors
        }
      });

      return validations.length > 0 ? validations : [];
    } catch {
      return [];
    }
  }

  createDebouncedValidator(callback, delay = 500) {
    try {
      // Defensive: ensure callback is a function
      if (typeof callback !== "function") {
        return () => {}; // Return no-op function
      }
      return debounce(callback, delay);
    } catch {
      return () => {}; // Return no-op function on error
    }
  }

  clearCache(requestType = null) {
    try {
      // Clear conversation ID(s) - optionally for a specific request type
      if (requestType) {
        delete this.conversationIds[requestType];
      } else {
        this.conversationIds = {};
      }
    } catch {
      // Silently ignore cache clearing errors
      this.conversationIds = {};
    }
  }
}

export default new DifyFormValidationService();
