import consts from "./consts.ts"

export default async () => {
    return fetch(`${consts.baseUrl}${consts.routes.health}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    })
}