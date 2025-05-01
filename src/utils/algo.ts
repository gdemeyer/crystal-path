import { Task } from "../types/types";

function compareTasks(a: Task, b: Task): number {
    const aScore = calculateScore(a)
    const bScore = calculateScore(b)
    return bScore - aScore
}

function calculateScore(a: Task) {
    return Math.sqrt(
        (Math.pow(21 - a.difficulty, 2)) +
        (Math.pow(a.impact, 2) * 1.2) +
        (Math.pow(21 - a.time, 2)) +
        (Math.pow(a.urgency, 2) * 1.2)
    );
}

export default function sortTasks(tasks: Task[]) {
    return tasks.sort(compareTasks)
}