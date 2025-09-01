import { Task } from "../types/types.ts"
import consts from "./consts.ts"

const postTask = async (task: Task) => {
    return fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.postTask}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(task)
    })
    .then(res => res.json())
}

export default postTask