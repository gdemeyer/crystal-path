import { Task } from "../types/types.ts"
import consts from "./consts.ts"
import { AuthenticationError } from "./errors.ts"

const editTask = async (taskId: string, task: Task, token: string): Promise<Task> => {
    const response = await fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.editTask}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, ...task })
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new AuthenticationError();
        }
        throw new Error(`Failed to edit task: ${response.statusText}`);
    }

    return response.json()
}

export default editTask
