import { Task } from "../types/types";


export default function sortTasks(tasks: Task[]) {
    return tasks.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}