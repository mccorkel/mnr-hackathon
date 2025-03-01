import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
/**
 * Register FHIR resources with the MCP server
 * @param server The MCP server
 * @param fhirClient The FHIR client
 */
export function registerResources(server, fhirClient) {
    // Patient resource
    server.resource("patient", new ResourceTemplate("fhir://patient/{id}", { list: undefined }), async (uri, { id }) => {
        try {
            const patient = await fhirClient.getPatient(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(patient, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching patient ${id}:`, error);
            throw error;
        }
    });
    // Patient conditions resource
    server.resource("conditions", new ResourceTemplate("fhir://patient/{id}/conditions", { list: undefined }), async (uri, { id }) => {
        try {
            const conditions = await fhirClient.getPatientConditions(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(conditions, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching conditions for patient ${id}:`, error);
            throw error;
        }
    });
    // Patient medications resource
    server.resource("medications", new ResourceTemplate("fhir://patient/{id}/medications", { list: undefined }), async (uri, { id }) => {
        try {
            const medications = await fhirClient.getPatientMedications(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(medications, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching medications for patient ${id}:`, error);
            throw error;
        }
    });
    // Patient observations resource
    server.resource("observations", new ResourceTemplate("fhir://patient/{id}/observations", { list: undefined }), async (uri, { id }) => {
        try {
            const observations = await fhirClient.getPatientObservations(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(observations, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching observations for patient ${id}:`, error);
            throw error;
        }
    });
    // Patient allergies resource
    server.resource("allergies", new ResourceTemplate("fhir://patient/{id}/allergies", { list: undefined }), async (uri, { id }) => {
        try {
            const allergies = await fhirClient.getPatientAllergies(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(allergies, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching allergies for patient ${id}:`, error);
            throw error;
        }
    });
    // Patient immunizations resource
    server.resource("immunizations", new ResourceTemplate("fhir://patient/{id}/immunizations", { list: undefined }), async (uri, { id }) => {
        try {
            const immunizations = await fhirClient.getPatientImmunizations(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(immunizations, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching immunizations for patient ${id}:`, error);
            throw error;
        }
    });
    // Patient procedures resource
    server.resource("procedures", new ResourceTemplate("fhir://patient/{id}/procedures", { list: undefined }), async (uri, { id }) => {
        try {
            const procedures = await fhirClient.getPatientProcedures(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(procedures, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching procedures for patient ${id}:`, error);
            throw error;
        }
    });
    // Patient encounters resource
    server.resource("encounters", new ResourceTemplate("fhir://patient/{id}/encounters", { list: undefined }), async (uri, { id }) => {
        try {
            const encounters = await fhirClient.getPatientEncounters(id);
            return {
                contents: [{
                        uri: uri.href,
                        text: JSON.stringify(encounters, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error(`Error fetching encounters for patient ${id}:`, error);
            throw error;
        }
    });
    // List all available resources for a patient
    server.resource("patient-resources", new ResourceTemplate("fhir://patient/{id}/resources", { list: undefined }), async (uri, { id }) => {
        const resources = [
            { name: "Patient Information", uri: `fhir://patient/${id}` },
            { name: "Conditions", uri: `fhir://patient/${id}/conditions` },
            { name: "Medications", uri: `fhir://patient/${id}/medications` },
            { name: "Observations", uri: `fhir://patient/${id}/observations` },
            { name: "Allergies", uri: `fhir://patient/${id}/allergies` },
            { name: "Immunizations", uri: `fhir://patient/${id}/immunizations` },
            { name: "Procedures", uri: `fhir://patient/${id}/procedures` },
            { name: "Encounters", uri: `fhir://patient/${id}/encounters` },
        ];
        return {
            contents: [{
                    uri: uri.href,
                    text: JSON.stringify(resources, null, 2)
                }]
        };
    });
}
//# sourceMappingURL=resources.js.map