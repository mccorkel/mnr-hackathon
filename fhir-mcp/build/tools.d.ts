import { FhirClient } from './fhir-client.js';
import { SmartAuth } from './smart-auth.js';
interface Tool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    handler: (params: any) => Promise<any>;
}
/**
 * Create FHIR tools for the MCP server
 * @param fhirClient The FHIR client
 * @param smartAuth The SMART on FHIR authentication client
 * @returns The FHIR tools
 */
export declare function createFhirTools(fhirClient: FhirClient, smartAuth: SmartAuth): Tool[];
export {};
