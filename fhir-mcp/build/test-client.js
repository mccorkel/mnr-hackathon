import { spawn } from "child_process";
console.log("Starting FHIR-MCP server...");
// Start the server process
const serverProcess = spawn("node", ["build/index.js"], {
    stdio: "inherit",
});
// Handle process exit
serverProcess.on("exit", (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code || 0);
});
// Handle signals to gracefully shut down
process.on("SIGINT", () => {
    console.log("Received SIGINT, shutting down server...");
    serverProcess.kill("SIGINT");
});
process.on("SIGTERM", () => {
    console.log("Received SIGTERM, shutting down server...");
    serverProcess.kill("SIGTERM");
});
//# sourceMappingURL=test-client.js.map