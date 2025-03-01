import { SmartAuth } from './smart-auth.js';
/**
 * SMART on FHIR client for interacting with Fasten healthcare data
 */
export declare class FhirClient {
    private baseUrl;
    private accessToken?;
    private smartAuth?;
    /**
     * Create a new FHIR client
     * @param baseUrl The base URL of the FHIR server
     * @param smartAuth Optional SMART on FHIR authentication client
     */
    constructor(baseUrl: string, smartAuth?: SmartAuth);
    /**
     * Set the access token for the FHIR client
     * @param token The access token
     */
    setAccessToken(token: string): void;
    /**
     * Execute a FHIR query directly against Fasten's query endpoint
     * @param query The FHIR query to execute
     * @returns The query result
     */
    executeQuery(query: string): Promise<any>;
    /**
     * Make a request to the FHIR server
     * @param path The path to request (without the base URL)
     * @param options Additional fetch options
     * @returns The response data
     */
    request<T>(path: string, options?: any): Promise<T>;
    /**
     * Get a patient by ID
     * @param id The patient ID
     * @returns The patient resource
     */
    getPatient(id: string): Promise<any>;
    /**
     * Search for patients
     * @param params Search parameters
     * @returns Bundle of patient resources
     */
    searchPatients(params?: Record<string, string>): Promise<any>;
    /**
     * Get a patient's conditions
     * @param patientId The patient ID
     * @returns Bundle of condition resources
     */
    getPatientConditions(patientId: string): Promise<any>;
    /**
     * Get a patient's medications
     * @param patientId The patient ID
     * @returns Bundle of medication resources
     */
    getPatientMedications(patientId: string): Promise<any>;
    /**
     * Get a patient's observations
     * @param patientId The patient ID
     * @param code Optional observation code to filter by
     * @returns Bundle of observation resources
     */
    getPatientObservations(patientId: string, code?: string): Promise<any>;
    /**
     * Get a patient's allergies
     * @param patientId The patient ID
     * @returns Bundle of allergy resources
     */
    getPatientAllergies(patientId: string): Promise<any>;
    /**
     * Get a patient's immunizations
     * @param patientId The patient ID
     * @returns Bundle of immunization resources
     */
    getPatientImmunizations(patientId: string): Promise<any>;
    /**
     * Get a patient's procedures
     * @param patientId The patient ID
     * @returns Bundle of procedure resources
     */
    getPatientProcedures(patientId: string): Promise<any>;
    /**
     * Get a patient's encounters
     * @param patientId The patient ID
     * @returns Bundle of encounter resources
     */
    getPatientEncounters(patientId: string): Promise<any>;
}
