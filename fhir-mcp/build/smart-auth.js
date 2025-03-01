import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import fs from 'fs';
import path from 'path';
import os from 'os';
/**
 * SMART on FHIR authentication client
 */
export class SmartAuth {
    clientId;
    clientSecret;
    redirectUri;
    scope;
    authorizeUrl;
    tokenUrl;
    baseUrl;
    tokenStorage;
    currentToken = null;
    /**
     * Create a new SMART on FHIR authentication client
     * @param options Authentication options
     */
    constructor(options) {
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret || null;
        this.redirectUri = options.redirectUri;
        this.scope = options.scope;
        this.authorizeUrl = options.authorizeUrl;
        this.tokenUrl = options.tokenUrl;
        this.baseUrl = options.baseUrl || new URL(this.authorizeUrl).origin;
        this.tokenStorage = path.join(os.homedir(), '.fhir-mcp-tokens.json');
        // Try to load existing token
        this.loadToken();
    }
    /**
     * Get the authorization URL for the SMART on FHIR authorization flow
     * @param state Optional state parameter for CSRF protection
     * @returns The authorization URL
     */
    getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scope,
            aud: new URL(this.authorizeUrl).origin,
        });
        if (state) {
            params.append('state', state);
        }
        return `${this.authorizeUrl}?${params.toString()}`;
    }
    /**
     * Exchange an authorization code for an access token
     * @param code The authorization code
     * @returns The token response
     */
    async exchangeCodeForToken(code) {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
        });
        if (this.clientSecret) {
            params.append('client_secret', this.clientSecret);
        }
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
        }
        const tokenResponse = await response.json();
        this.currentToken = tokenResponse;
        this.saveToken();
        return tokenResponse;
    }
    /**
     * Refresh an access token using a refresh token
     * @param refreshToken The refresh token
     * @returns The token response
     */
    async refreshToken(refreshToken) {
        const tokenToUse = refreshToken || this.currentToken?.refresh_token;
        if (!tokenToUse) {
            throw new Error('No refresh token available');
        }
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenToUse,
            client_id: this.clientId,
        });
        if (this.clientSecret) {
            params.append('client_secret', this.clientSecret);
        }
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
        }
        const tokenResponse = await response.json();
        this.currentToken = tokenResponse;
        this.saveToken();
        return tokenResponse;
    }
    /**
     * Authenticate directly with Fasten using username and password
     * @param username The username
     * @param password The password
     * @returns The token response
     */
    async signIn(username, password) {
        const signInUrl = `${this.baseUrl}/api/auth/signin`;
        console.error(`Authenticating with Fasten at ${signInUrl}`);
        const response = await fetch(signInUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Authentication failed (${response.status} ${response.statusText}): ${errorText}`);
        }
        const responseData = await response.json();
        // Fasten's response format might be different from standard OAuth
        // Adapt the response to our TokenResponse format
        const tokenResponse = {
            access_token: responseData.token || responseData.access_token,
            token_type: responseData.token_type || 'Bearer',
            expires_in: responseData.expires_in || 3600, // Default to 1 hour if not provided
            refresh_token: responseData.refresh_token,
            issued_at: Date.now(),
        };
        this.currentToken = tokenResponse;
        this.saveToken();
        console.error('Successfully authenticated with Fasten');
        return tokenResponse;
    }
    /**
     * Get the current access token, refreshing if necessary
     * @returns The current access token
     */
    async getAccessToken() {
        if (!this.currentToken) {
            throw new Error('No token available. Please authenticate first.');
        }
        // Check if token is expired or about to expire (within 5 minutes)
        const expiresAt = this.currentToken.expires_in ?
            (this.currentToken.issued_at || Date.now()) + (this.currentToken.expires_in * 1000) :
            null;
        if (expiresAt && Date.now() > expiresAt - 5 * 60 * 1000) {
            // Token is expired or about to expire, refresh it
            if (this.currentToken.refresh_token) {
                await this.refreshToken(this.currentToken.refresh_token);
            }
            else {
                throw new Error('Token is expired and no refresh token is available');
            }
        }
        return this.currentToken.access_token;
    }
    /**
     * Save the current token to storage
     */
    saveToken() {
        if (this.currentToken) {
            // Add issued_at if not present
            if (!this.currentToken.issued_at) {
                this.currentToken.issued_at = Date.now();
            }
            try {
                fs.writeFileSync(this.tokenStorage, JSON.stringify(this.currentToken, null, 2), 'utf8');
            }
            catch (error) {
                console.error('Failed to save token:', error);
            }
        }
    }
    /**
     * Load token from storage
     */
    loadToken() {
        try {
            if (fs.existsSync(this.tokenStorage)) {
                const data = fs.readFileSync(this.tokenStorage, 'utf8');
                this.currentToken = JSON.parse(data);
            }
        }
        catch (error) {
            console.error('Failed to load token:', error);
            this.currentToken = null;
        }
    }
    /**
     * Clear the stored token
     */
    clearToken() {
        this.currentToken = null;
        try {
            if (fs.existsSync(this.tokenStorage)) {
                fs.unlinkSync(this.tokenStorage);
            }
        }
        catch (error) {
            console.error('Failed to clear token:', error);
        }
    }
}
//# sourceMappingURL=smart-auth.js.map