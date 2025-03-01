/**
 * SMART on FHIR authentication client
 */
export declare class SmartAuth {
    private clientId;
    private clientSecret;
    private redirectUri;
    private scope;
    private authorizeUrl;
    private tokenUrl;
    private baseUrl;
    private tokenStorage;
    private currentToken;
    /**
     * Create a new SMART on FHIR authentication client
     * @param options Authentication options
     */
    constructor(options: {
        clientId: string;
        clientSecret?: string;
        redirectUri: string;
        scope: string;
        authorizeUrl: string;
        tokenUrl: string;
        baseUrl?: string;
    });
    /**
     * Get the authorization URL for the SMART on FHIR authorization flow
     * @param state Optional state parameter for CSRF protection
     * @returns The authorization URL
     */
    getAuthorizationUrl(state?: string): string;
    /**
     * Exchange an authorization code for an access token
     * @param code The authorization code
     * @returns The token response
     */
    exchangeCodeForToken(code: string): Promise<TokenResponse>;
    /**
     * Refresh an access token using a refresh token
     * @param refreshToken The refresh token
     * @returns The token response
     */
    refreshToken(refreshToken?: string): Promise<TokenResponse>;
    /**
     * Authenticate directly with Fasten using username and password
     * @param username The username
     * @param password The password
     * @returns The token response
     */
    signIn(username: string, password: string): Promise<TokenResponse>;
    /**
     * Get the current access token, refreshing if necessary
     * @returns The current access token
     */
    getAccessToken(): Promise<string>;
    /**
     * Save the current token to storage
     */
    private saveToken;
    /**
     * Load token from storage
     */
    private loadToken;
    /**
     * Clear the stored token
     */
    clearToken(): void;
}
/**
 * Token response from the SMART on FHIR token endpoint
 */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
    patient?: string;
    id_token?: string;
    issued_at?: number;
}
