import { Task } from "../types/types.ts"
import consts from "./consts.ts"
import { AuthenticationError } from "./errors.ts"

const postTask = async (task: Task, token?: string): Promise<Task> => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.postTask}`, {
        method: "POST",
        headers,
        body: JSON.stringify(task)
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new AuthenticationError();
        }
        throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json()
}

export default postTask