#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Constants
const FASTEN_BASE_URL = "https://firefly-optimum-initially.ngrok-free.app";
const AUTH_URL = `${FASTEN_BASE_URL}/web/auth/signin`;
const API_BASE_URL = `${FASTEN_BASE_URL}`;
// Store the auth token in memory
let authToken = null;
// Create server instance
const server = new McpServer({
    name: "fasten-mcp",
    version: "1.0.0",
});
// Helper function to check if token is valid
async function isTokenValid(token) {
    try {
        // Try to make a simple API call that requires authentication
        const response = await fetch(`${API_BASE_URL}/secure/summary`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.status === 200;
    }
    catch (error) {
        console.error("Error validating token:", error);
        return false;
    }
}
// Helper function to make authenticated API requests
async function makeAuthenticatedRequest(endpoint, method = "GET", body) {
    if (!authToken) {
        throw new Error("No authentication token available. Please set a token using the 'set-auth-token' tool.");
    }
    const options = {
        method,
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
    };
    if (body && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                authToken = null;
                throw new Error("Authentication token is invalid or has expired. Please provide a new token.");
            }
            throw new Error(`API request failed with status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Error making request to ${endpoint}:`, error);
        throw error;
    }
}
// Helper function to extract error message
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
// Register authentication tools
server.tool("check-auth-status", "Check if a valid authentication token is set for Fasten", {}, async () => {
    if (!authToken) {
        return {
            content: [
                {
                    type: "text",
                    text: "No authentication token is currently set. Please set a token using the 'set-auth-token' tool.",
                },
            ],
        };
    }
    const isValid = await isTokenValid(authToken);
    if (!isValid) {
        authToken = null;
        return {
            content: [
                {
                    type: "text",
                    text: "The authentication token is invalid or has expired. Please provide a new token using the 'set-auth-token' tool.",
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: "You have a valid authentication token for Fasten and can make API requests.",
            },
        ],
    };
});
server.tool("set-auth-token", "Set the authentication token for Fasten API access", {
    token: z.string().describe("The OAuth access token received from Fasten authentication"),
}, async ({ token }) => {
    authToken = token;
    // Validate the token immediately
    const isValid = await isTokenValid(token);
    if (!isValid) {
        authToken = null;
        return {
            content: [
                {
                    type: "text",
                    text: "The provided token appears to be invalid. Please check the token and try again.",
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: "Authentication token saved and validated successfully. You can now make requests to the Fasten API.",
            },
        ],
    };
});
server.tool("clear-auth-token", "Clear the current authentication token", {}, async () => {
    authToken = null;
    return {
        content: [
            {
                type: "text",
                text: "Authentication token has been cleared. You will need to set a new token to access Fasten API.",
            },
        ],
    };
});
// Register API endpoint tools
server.tool("get-summary", "Get user summary data from Fasten", {}, async () => {
    try {
        const data = await makeAuthenticatedRequest("/secure/summary");
        return {
            content: [
                {
                    type: "text",
                    text: `Summary data retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving summary data: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("list-sources", "List all sources from Fasten", {}, async () => {
    try {
        const data = await makeAuthenticatedRequest("/secure/source");
        return {
            content: [
                {
                    type: "text",
                    text: `Sources retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving sources: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("get-source", "Get a specific source by ID", {
    sourceId: z.string().describe("The ID of the source to retrieve"),
}, async ({ sourceId }) => {
    try {
        const data = await makeAuthenticatedRequest(`/secure/source/${sourceId}`);
        return {
            content: [
                {
                    type: "text",
                    text: `Source retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving source: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("list-fhir-resources", "List FHIR resources", {}, async () => {
    try {
        const data = await makeAuthenticatedRequest("/secure/resource/fhir");
        return {
            content: [
                {
                    type: "text",
                    text: `FHIR resources retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving FHIR resources: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("get-fhir-resource", "Get a specific FHIR resource by source ID and resource ID", {
    sourceId: z.string().describe("The ID of the source"),
    resourceId: z.string().describe("The ID of the resource"),
}, async ({ sourceId, resourceId }) => {
    try {
        const data = await makeAuthenticatedRequest(`/secure/resource/fhir/${sourceId}/${resourceId}`);
        return {
            content: [
                {
                    type: "text",
                    text: `FHIR resource retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving FHIR resource: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("sync-source", "Trigger synchronization for a specific source", {
    sourceId: z.string().describe("The ID of the source to synchronize"),
}, async ({ sourceId }) => {
    try {
        const data = await makeAuthenticatedRequest(`/secure/source/${sourceId}/sync`, "POST");
        return {
            content: [
                {
                    type: "text",
                    text: `Source synchronization triggered successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error triggering source synchronization: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("get-source-summary", "Get summary for a specific source", {
    sourceId: z.string().describe("The ID of the source"),
}, async ({ sourceId }) => {
    try {
        const data = await makeAuthenticatedRequest(`/secure/source/${sourceId}/summary`);
        return {
            content: [
                {
                    type: "text",
                    text: `Source summary retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving source summary: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("create-reconnect-source", "Create a new reconnect source", {
    sourceData: z.object({}).passthrough().describe("The source data to create"),
}, async ({ sourceData }) => {
    try {
        const data = await makeAuthenticatedRequest("/secure/source", "POST", sourceData);
        return {
            content: [
                {
                    type: "text",
                    text: `Reconnect source created successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating reconnect source: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("create-manual-source", "Create a new manual source", {
    sourceData: z.object({}).passthrough().describe("The source data to create"),
}, async ({ sourceData }) => {
    try {
        const data = await makeAuthenticatedRequest("/secure/source/manual", "POST", sourceData);
        return {
            content: [
                {
                    type: "text",
                    text: `Manual source created successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating manual source: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("delete-source", "Delete a specific source", {
    sourceId: z.string().describe("The ID of the source to delete"),
}, async ({ sourceId }) => {
    try {
        const data = await makeAuthenticatedRequest(`/secure/source/${sourceId}`, "DELETE");
        return {
            content: [
                {
                    type: "text",
                    text: `Source deleted successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error deleting source: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("delete-account", "Delete the current user account", {}, async () => {
    try {
        const data = await makeAuthenticatedRequest("/secure/account/me", "DELETE");
        // Clear the token after account deletion
        authToken = null;
        return {
            content: [
                {
                    type: "text",
                    text: `Account deleted successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error deleting account: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("get-resource-fhir-graph", "Get FHIR resource graph by type", {
    graphType: z.string().describe("The type of graph to retrieve"),
    parameters: z.object({}).passthrough().describe("Additional parameters for the graph request"),
}, async ({ graphType, parameters }) => {
    try {
        const data = await makeAuthenticatedRequest(`/secure/resource/graph/${graphType}`, "POST", parameters);
        return {
            content: [
                {
                    type: "text",
                    text: `FHIR resource graph retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving FHIR resource graph: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("create-resource-composition", "Create a resource composition", {
    compositionData: z.object({}).passthrough().describe("The composition data to create"),
}, async ({ compositionData }) => {
    try {
        const data = await makeAuthenticatedRequest("/secure/resource/composition", "POST", compositionData);
        return {
            content: [
                {
                    type: "text",
                    text: `Resource composition created successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating resource composition: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("create-related-resources", "Create related resources", {
    relatedData: z.object({}).passthrough().describe("The related resources data to create"),
}, async ({ relatedData }) => {
    try {
        const data = await makeAuthenticatedRequest("/secure/resource/related", "POST", relatedData);
        return {
            content: [
                {
                    type: "text",
                    text: `Related resources created successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating related resources: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("query-fhir-resources", "Query FHIR resources", {
    queryParams: z.object({}).passthrough().describe("The query parameters"),
}, async ({ queryParams }) => {
    try {
        const data = await makeAuthenticatedRequest("/secure/query", "POST", queryParams);
        return {
            content: [
                {
                    type: "text",
                    text: `FHIR resources query completed successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error querying FHIR resources: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("get-dashboards", "Get dashboards", {}, async () => {
    try {
        const data = await makeAuthenticatedRequest("/secure/dashboards");
        return {
            content: [
                {
                    type: "text",
                    text: `Dashboards retrieved successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving dashboards: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
server.tool("add-dashboard-location", "Add a dashboard location", {
    locationData: z.object({}).passthrough().describe("The dashboard location data to add"),
}, async ({ locationData }) => {
    try {
        const data = await makeAuthenticatedRequest("/secure/dashboards", "POST", locationData);
        return {
            content: [
                {
                    type: "text",
                    text: `Dashboard location added successfully:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error adding dashboard location: ${getErrorMessage(error)}`,
                },
            ],
        };
    }
});
// Main function to run the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Fasten MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map