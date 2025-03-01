# 🔒 Fasten MCP Server

A Model Context Protocol (MCP) server for integrating Claude and other LLMs with Fasten healthcare data services.

## 📚 Overview

This MCP server enables AI assistants to interact with the Fasten healthcare API, providing access to FHIR resources and other healthcare data. The server handles API access to Fasten and provides tools for querying and manipulating healthcare data.

## ✨ Features

- OAuth token management for Fasten API
- Access to FHIR resources
- Source management
- Dashboard access
- Resource composition and querying

## 🔧 Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

## 🚀 Usage with Claude for Desktop

1. Configure Claude for Desktop to use this MCP server by editing the configuration file at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fasten-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/fhir-mcp/build/index.js"
      ]
    }
  }
}
```

2. Restart Claude for Desktop
3. In Claude, you can now use the Fasten MCP server by asking Claude to "access Fasten"

## 🚀 Usage with Ollama and MCP Bridge

This MCP server can also be used with local LLMs through the [ollama-mcp-bridge](https://github.com/patruff/ollama-mcp-bridge):

1. Set up the ollama-mcp-bridge according to its documentation
2. Configure the bridge to use this MCP server in `bridge_config.json`:

```json
{
  "mcpServers": {
    "fasten-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/fhir-mcp/build/index.js"
      ]
    }
  },
  "llm": {
    "model": "your-chosen-model",
    "baseUrl": "http://your-ollama-host:11434"
  }
}
```

3. Start the bridge and interact with your local LLM

## 🔑 Authentication Flow

1. Authenticate with Fasten through their OAuth flow in your browser
2. Obtain the OAuth access token
3. Provide the token to the AI assistant using the `set-auth-token` tool
4. The MCP server will validate and store the token for API requests
5. If the token expires, you'll need to obtain a new one and set it again

## 🛠️ Available Tools

### Authentication Tools

- `check-auth-status` - Check if you have a valid token for Fasten
- `set-auth-token` - Set the OAuth access token for API access
- `clear-auth-token` - Clear the current authentication token

### API Tools

- `get-summary` - Get user summary data
- `list-sources` - List all sources
- `get-source` - Get a specific source by ID
- `sync-source` - Trigger synchronization for a source
- `get-source-summary` - Get summary for a source
- `create-reconnect-source` - Create a new reconnect source
- `create-manual-source` - Create a new manual source
- `delete-source` - Delete a source
- `list-fhir-resources` - List FHIR resources
- `get-fhir-resource` - Get a specific FHIR resource
- `get-resource-fhir-graph` - Get FHIR resource graph
- `create-resource-composition` - Create a resource composition
- `create-related-resources` - Create related resources
- `query-fhir-resources` - Query FHIR resources
- `get-dashboards` - Get dashboards
- `add-dashboard-location` - Add a dashboard location
- `delete-account` - Delete the current user account

## 📝 Example Conversation

User: "Let's access Fasten"

Claude: "I'll help you access Fasten. Let me check if you have a valid authentication token."

*Claude checks authentication status*

Claude: "You don't have a valid authentication token set. Please authenticate with Fasten through their OAuth flow and provide me with the access token."

User: "Here's my token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

*Claude sets and validates the token*

Claude: "Thanks! I've saved and validated your authentication token. You're now authenticated with Fasten and can access your healthcare data."

User: "Show me my summary"

*Claude retrieves and displays the summary data*

## 🔒 Security Notes

- Your authentication token is stored only in memory and is not persisted between sessions
- The token is only used to make requests to the Fasten API
- If you close the AI assistant, you'll need to set the token again when you restart

## 📄 License

MIT
