import consts from "./consts.ts"

const getTasks = async (token?: string) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.getTasks}`, {
        method: "GET",
        headers,
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure we return an array
    if (!Array.isArray(data)) {
        console.error('Expected array from getTasks, got:', data);
        return [];
    }

    return data;
}

export default getTasks