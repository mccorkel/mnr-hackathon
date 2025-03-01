import { z } from "zod";
/**
 * Register FHIR-related prompts with the MCP server
 * @param server The MCP server
 */
export function registerPrompts(server) {
    // Prompt for analyzing patient data
    server.prompt("analyze-patient", {
        patientId: z.string(),
        focusArea: z.string().optional(),
    }, ({ patientId, focusArea }) => {
        let promptText = `Please analyze the health data for patient ${patientId}.`;
        if (focusArea) {
            promptText += ` Focus specifically on their ${focusArea}.`;
        }
        promptText += `\n\nYou can use the following resources to gather information:
- fhir://patient/${patientId} (basic patient information)
- fhir://patient/${patientId}/conditions (medical conditions)
- fhir://patient/${patientId}/medications (medications)
- fhir://patient/${patientId}/observations (lab results and vital signs)
- fhir://patient/${patientId}/allergies (allergies and intolerances)
- fhir://patient/${patientId}/immunizations (vaccination history)
- fhir://patient/${patientId}/procedures (medical procedures)
- fhir://patient/${patientId}/encounters (healthcare visits)

You can also use the "patient-summary" tool to get a quick overview of the patient's record.

Please provide a comprehensive analysis of the patient's health status, including:
1. A summary of their key health issues
2. Any concerning trends in their data
3. Potential health risks based on their profile
4. Recommendations for further monitoring or interventions`;
        return {
            messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: promptText
                    }
                }]
        };
    });
    // Prompt for medication review
    server.prompt("medication-review", {
        patientId: z.string(),
    }, ({ patientId }) => {
        const promptText = `Please review the medications for patient ${patientId}.

You can use the following resources to gather information:
- fhir://patient/${patientId} (basic patient information)
- fhir://patient/${patientId}/medications (medications)
- fhir://patient/${patientId}/conditions (medical conditions)
- fhir://patient/${patientId}/allergies (allergies and intolerances)

Please provide a comprehensive review of the patient's medications, including:
1. A list of all current medications
2. The purpose of each medication
3. Potential drug interactions or contraindications
4. Any medications that may be redundant or unnecessary
5. Recommendations for medication management`;
        return {
            messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: promptText
                    }
                }]
        };
    });
    // Prompt for health summary
    server.prompt("health-summary", {
        patientId: z.string(),
        timeframe: z.string().optional(),
    }, ({ patientId, timeframe }) => {
        let promptText = `Please provide a summary of the health status for patient ${patientId}`;
        if (timeframe) {
            promptText += ` over the past ${timeframe}`;
        }
        promptText += `.

You can use the following resources to gather information:
- fhir://patient/${patientId} (basic patient information)
- fhir://patient/${patientId}/conditions (medical conditions)
- fhir://patient/${patientId}/medications (medications)
- fhir://patient/${patientId}/observations (lab results and vital signs)
- fhir://patient/${patientId}/allergies (allergies and intolerances)
- fhir://patient/${patientId}/immunizations (vaccination history)
- fhir://patient/${patientId}/procedures (medical procedures)
- fhir://patient/${patientId}/encounters (healthcare visits)

You can also use the "patient-summary" tool to get a quick overview of the patient's record.

Please provide a concise summary that would be appropriate for a patient to understand their own health status, including:
1. Key health conditions
2. Important recent changes
3. Areas that are well-managed
4. Areas that may need attention
5. Preventive care recommendations`;
        return {
            messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: promptText
                    }
                }]
        };
    });
    // Prompt for lab result interpretation
    server.prompt("interpret-labs", {
        patientId: z.string(),
        observationCode: z.string().optional(),
    }, ({ patientId, observationCode }) => {
        let promptText = `Please interpret the lab results for patient ${patientId}`;
        if (observationCode) {
            promptText += ` focusing on the observation code ${observationCode}`;
        }
        promptText += `.

You can use the following resources to gather information:
- fhir://patient/${patientId} (basic patient information)
- fhir://patient/${patientId}/observations (lab results and vital signs)
- fhir://patient/${patientId}/conditions (medical conditions)

You can also use the "get-observation" tool to retrieve specific observations by code.

Please provide an interpretation of the lab results that would be understandable to a patient, including:
1. What each test measures
2. Whether results are normal, high, or low
3. What abnormal results might indicate
4. How results relate to the patient's known conditions
5. Any recommendations for follow-up based on these results`;
        return {
            messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: promptText
                    }
                }]
        };
    });
}
//# sourceMappingURL=prompts.js.map