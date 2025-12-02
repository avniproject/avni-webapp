import axios from "axios";
import { debounce } from "lodash";

// Create dedicated axios instance for Dify API to bypass global interceptors
const difyAxios = axios.create();

class DifyFormValidationService {
  constructor() {
    this.apiKey = null;
    // Use Vite proxy to avoid CORS issues
    this.baseUrl = "/dify-api/v1";
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  getApiKey() {
    return this.apiKey;
  }

  formatQuestionForDify(formElement, formType = "", formContext = {}, requestType = "FormValidation") {
    if (requestType === "VisitSchedule") {
      return this.formatVisitScheduleQuestion(formElement);
    }

    // Default FormValidation logic
    const options = formElement.concept?.answers?.length > 0 ? formElement.concept.answers.map((answer) => answer.name).join(", ") : "None";

    // Build enhanced context string following Python pattern
    const contextParts = [];

    // Add current field configuration
    if (formElement.concept) {
      contextParts.push(`Current dataType: ${formElement.concept.dataType || "Unknown"}`);
      contextParts.push(`Current type: ${formElement.type || "Unknown"}`);
    }

    // Add form context
    if (formType) {
      contextParts.push(`Form type: ${formType}`);
    }

    if (formContext.domain) {
      contextParts.push(`Domain: ${formContext.domain}`);
    }

    const contextString = contextParts.length > 0 ? contextParts.join(" | ") : "No specific context provided";

    return `Question Text: ${formElement.name}
Options: ${options}
Context: ${contextString}

Please validate this form element according to Avni rules and provide recommendations.`;
  }

  formatVisitScheduleQuestion(formElement) {
    return `Requirements: ${formElement.requirements || "Not specified"}`;
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
              context: formElement.context || {},
            }
          : {};

      const response = await difyAxios.post(
        `${this.baseUrl}/chat-messages`,
        {
          inputs,
          query: question,
          response_mode: "blocking",
          conversation_id: this.conversationId || "", // Use stored conversation ID for context
          user: "avni-form-designer",
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          withCredentials: false,
          timeout: requestType === "VisitSchedule" ? 20000 : 5000, // 10s for VisitSchedule, 5s for FormValidation
        },
      );

      const validationResults = this.parseDifyResponse(response, requestType);
      return validationResults;
    } catch (error) {
      console.error("Dify validation API call failed:", error);
      return [];
    }
  }

  async validateBatchFormElements(formElements, formType) {
    if (!this.apiKey) {
      console.warn("Dify API key not configured");
      return formElements.map(() => []);
    }

    const questions = formElements.map((formElement) => this.formatQuestionForDify(formElement, formType));

    try {
      const batchQuestion = questions.join("\n\n---\n\n");

      const response = await difyAxios.post(
        `${this.baseUrl}/chat-messages`,
        {
          inputs: {},
          query: batchQuestion,
          response_mode: "blocking",
          conversation_id: "",
          user: "avni-form-designer",
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          withCredentials: false,
          timeout: 20000, // 20 second timeout for batch
        },
      );

      return this.parseBatchDifyResponse(response.data, formElements.length);
    } catch (error) {
      console.error("Dify batch validation API call failed:", error);
      return formElements.map(() => []);
    }
  }

  parseDifyResponse(response, requestType = "FormValidation") {
    try {
      const answer = response.data?.answer || "";
      const conversationId = response.data?.conversation_id || "";

      if (conversationId) {
        this.conversationId = conversationId;
      }

      if (answer) {
        // For VisitSchedule, detect if it's scenarios or code
        if (requestType === "VisitSchedule") {
          // Check if response contains JavaScript code (function signature)
          const hasJavaScriptCode =
            answer.includes("({params, imports}) =>") || answer.includes("```javascript") || answer.includes("```js");

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
          // Handle old format (direct array)
          return Array.isArray(parsed) ? parsed : parsed;
        } catch {
          return this.extractValidationFromText(answer);
        }
      }

      return [];
    } catch (error) {
      console.error("Failed to parse Dify response:", error);
      return [];
    }
  }

  extractValidationFromText(text) {
    // Extract validation messages from plain text response
    const lines = text.split("\n").filter((line) => line.trim());
    const validations = [];

    lines.forEach((line) => {
      if (line.includes("CRITICAL:") || line.includes("HIGH:") || line.includes("MEDIUM:") || line.includes("LOW:")) {
        validations.push({
          formElementUuid: null,
          formElementName: "Unknown",
          message: line.trim(),
        });
      }
    });

    return validations.length > 0 ? validations : [];
  }

  createDebouncedValidator(callback, delay = 500) {
    return debounce(callback, delay);
  }

  clearCache() {
    // Cache removed - method kept for API compatibility
    this.conversationId = null;
  }
}

export default new DifyFormValidationService();
