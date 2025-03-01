import { FhirClient } from "./fhir-client.js";
/**
 * Register FHIR resources with the MCP server
 * @param server The MCP server
 * @param fhirClient The FHIR client
 */
export declare function registerResources(server: any, fhirClient: FhirClient): void;
