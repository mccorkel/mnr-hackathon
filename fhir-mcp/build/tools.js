import { z } from 'zod';
/**
 * Create FHIR tools for the MCP server
 * @param fhirClient The FHIR client
 * @param smartAuth The SMART on FHIR authentication client
 * @returns The FHIR tools
 */
export function createFhirTools(fhirClient, smartAuth) {
    return [
        {
            name: 'search_patients',
            description: 'Search for patients by name, identifier, birthdate, gender, or other criteria',
            parameters: {
                name: z.string().optional().describe('Patient name to search for'),
                identifier: z.string().optional().describe('Patient identifier to search for'),
                birthDate: z.string().optional().describe('Patient birth date to search for (YYYY-MM-DD)'),
                gender: z.string().optional().describe('Patient gender to search for (male, female, other, unknown)'),
                limit: z.number().optional().describe('Maximum number of results to return'),
            },
            handler: async (params) => {
                try {
                    const result = await fhirClient.searchPatients(params);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(result, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'get_observation',
            description: 'Get a specific observation by patient ID and code',
            parameters: {
                patientId: z.string().describe('Patient ID'),
                code: z.string().describe('Observation code'),
            },
            handler: async (params) => {
                try {
                    // Use the request method with the appropriate path
                    const result = await fhirClient.request(`Observation?patient=${params.patientId}&code=${params.code}`);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(result, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'authorize',
            description: 'Authorize with a FHIR server',
            parameters: {},
            handler: async () => {
                try {
                    const url = await smartAuth.getAuthorizationUrl();
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({ url }, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'exchange_token',
            description: 'Exchange an authorization code for an access token',
            parameters: {
                code: z.string().describe('Authorization code'),
            },
            handler: async (params) => {
                try {
                    const token = await smartAuth.exchangeCodeForToken(params.code);
                    fhirClient.setAccessToken(token.access_token);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({ success: true, token }, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'refresh_token',
            description: 'Refresh an access token',
            parameters: {},
            handler: async () => {
                try {
                    const token = await smartAuth.refreshToken();
                    fhirClient.setAccessToken(token.access_token);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({ success: true, token }, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'set_access_token',
            description: 'Set an access token directly',
            parameters: {
                accessToken: z.string().describe('Access token'),
            },
            handler: async (params) => {
                try {
                    fhirClient.setAccessToken(params.accessToken);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({ success: true }, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'signin_fasten',
            description: 'Sign in to Fasten directly with username and password',
            parameters: {
                username: z.string().describe('Username or email'),
                password: z.string().describe('Password'),
            },
            handler: async (params) => {
                try {
                    const token = await smartAuth.signIn(params.username, params.password);
                    fhirClient.setAccessToken(token.access_token);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({ success: true, token }, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'execute_query',
            description: 'Execute a FHIR query',
            parameters: {
                query: z.string().describe('FHIR query to execute'),
            },
            handler: async (params) => {
                try {
                    const result = await fhirClient.executeQuery(params.query);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(result, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
        {
            name: 'get_patient_summary',
            description: 'Get a summary of a patient\'s health record',
            parameters: {
                patientId: z.string().describe('Patient ID'),
            },
            handler: async (params) => {
                try {
                    // Get patient details
                    const patient = await fhirClient.getPatient(params.patientId);
                    // Get conditions
                    const conditions = await fhirClient.getPatientConditions(params.patientId);
                    // Get medications
                    const medications = await fhirClient.getPatientMedications(params.patientId);
                    // Get allergies
                    const allergies = await fhirClient.getPatientAllergies(params.patientId);
                    // Get recent observations
                    const observations = await fhirClient.getPatientObservations(params.patientId);
                    const summary = {
                        patient,
                        conditions,
                        medications,
                        allergies,
                        observations,
                    };
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(summary, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: 'text',
                                text: `Error: ${error.message}`
                            }],
                        isError: true
                    };
                }
            },
        },
    ];
}
//# sourceMappingURL=tools.js.map