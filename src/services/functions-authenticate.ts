import consts from "./consts.ts"

interface AuthenticateResponse {
    token: string;
    userId: string;
}

/**
 * Sends a Google ID token (or demo token) to the backend /authenticate endpoint.
 * The backend validates it and returns a long-lived backend JWT.
 * 
 * @param googleToken - The raw Google credential or demo token
 * @returns Backend JWT token and userId
 */
const authenticate = async (googleToken: string): Promise<AuthenticateResponse> => {
    const response = await fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.authenticate}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${googleToken}`,
        },
    })

    if (!response.ok) {
        throw new Error('Authentication failed')
    }

    return response.json()
}

export default authenticate
