import fetch from 'node-fetch';
/**
 * SMART on FHIR client for interacting with Fasten healthcare data
 */
export class FhirClient {
    baseUrl;
    accessToken;
    smartAuth;
    /**
     * Create a new FHIR client
     * @param baseUrl The base URL of the FHIR server
     * @param smartAuth Optional SMART on FHIR authentication client
     */
    constructor(baseUrl, smartAuth) {
        this.baseUrl = baseUrl;
        this.smartAuth = smartAuth;
    }
    /**
     * Set the access token for the FHIR client
     * @param token The access token
     */
    setAccessToken(token) {
        this.accessToken = token;
    }
    /**
     * Execute a FHIR query directly against Fasten's query endpoint
     * @param query The FHIR query to execute
     * @returns The query result
     */
    async executeQuery(query) {
        let token;
        // Try to get token from SmartAuth first
        if (this.smartAuth) {
            try {
                token = await this.smartAuth.getAccessToken();
            }
            catch (error) {
                console.error('Failed to get access token from SmartAuth:', error);
                // Fall back to stored access token
                if (this.accessToken) {
                    token = this.accessToken;
                }
            }
        }
        else if (this.accessToken) {
            token = this.accessToken;
        }
        if (!token) {
            throw new Error('No access token available. Please authenticate first.');
        }
        const queryUrl = `${this.baseUrl}/api/secure/query`;
        console.error(`Executing FHIR query at ${queryUrl}`);
        const response = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Query execution failed (${response.status} ${response.statusText}): ${errorText}`);
        }
        return await response.json();
    }
    /**
     * Make a request to the FHIR server
     * @param path The path to request (without the base URL)
     * @param options Additional fetch options
     * @returns The response data
     */
    async request(path, options = {}) {
        const url = new URL(path, this.baseUrl).toString();
        const headers = {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json',
            ...(options.headers || {}),
        };
        // Try to get token from SmartAuth first, fall back to stored token
        if (this.smartAuth) {
            try {
                const token = await this.smartAuth.getAccessToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
            catch (error) {
                if (this.accessToken) {
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                }
                else {
                    console.warn('No access token available for request');
                }
            }
        }
        else if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            throw new Error(`FHIR request failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Get a patient by ID
     * @param id The patient ID
     * @returns The patient resource
     */
    async getPatient(id) {
        return this.request(`Patient/${id}`);
    }
    /**
     * Search for patients
     * @param params Search parameters
     * @returns Bundle of patient resources
     */
    async searchPatients(params = {}) {
        const searchParams = new URLSearchParams(params);
        return this.request(`Patient?${searchParams.toString()}`);
    }
    /**
     * Get a patient's conditions
     * @param patientId The patient ID
     * @returns Bundle of condition resources
     */
    async getPatientConditions(patientId) {
        return this.request(`Condition?patient=${patientId}`);
    }
    /**
     * Get a patient's medications
     * @param patientId The patient ID
     * @returns Bundle of medication resources
     */
    async getPatientMedications(patientId) {
        return this.request(`MedicationRequest?patient=${patientId}`);
    }
    /**
     * Get a patient's observations
     * @param patientId The patient ID
     * @param code Optional observation code to filter by
     * @returns Bundle of observation resources
     */
    async getPatientObservations(patientId, code) {
        let url = `Observation?patient=${patientId}`;
        if (code) {
            url += `&code=${code}`;
        }
        return this.request(url);
    }
    /**
     * Get a patient's allergies
     * @param patientId The patient ID
     * @returns Bundle of allergy resources
     */
    async getPatientAllergies(patientId) {
        return this.request(`AllergyIntolerance?patient=${patientId}`);
    }
    /**
     * Get a patient's immunizations
     * @param patientId The patient ID
     * @returns Bundle of immunization resources
     */
    async getPatientImmunizations(patientId) {
        return this.request(`Immunization?patient=${patientId}`);
    }
    /**
     * Get a patient's procedures
     * @param patientId The patient ID
     * @returns Bundle of procedure resources
     */
    async getPatientProcedures(patientId) {
        return this.request(`Procedure?patient=${patientId}`);
    }
    /**
     * Get a patient's encounters
     * @param patientId The patient ID
     * @returns Bundle of encounter resources
     */
    async getPatientEncounters(patientId) {
        return this.request(`Encounter?patient=${patientId}`);
    }
}
//# sourceMappingURL=fhir-client.js.map