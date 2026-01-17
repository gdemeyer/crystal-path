export interface Task {
    title: String;
    difficulty: number;
    impact: number;
    time: number;
    urgency: number;
    userId?: string;
    _id?: string;
    status?: string;
    statusChanged?: number;
}

export const isTask = (obj: unknown): obj is Task => {
    if (typeof obj !== 'object' || obj === null) return false;
    const task = obj as Record<string, unknown>;
    return (
        typeof task.title === 'string' &&
        typeof task.difficulty === 'number' &&
        typeof task.impact === 'number' &&
        typeof task.time === 'number' &&
        typeof task.urgency === 'number'
    );
};