import consts from "./consts.ts"

interface GetTasksOptions {
    view?: 'today' | 'backlog';
    date?: string;
}

const getTasks = async (token?: string, options?: GetTasksOptions) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.getTasks}`;
    
    // Add query parameters if provided
    if (options?.view) {
        const params = new URLSearchParams();
        params.append('view', options.view);
        if (options.date) {
            params.append('date', options.date);
        }
        url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
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