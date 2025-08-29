import consts from "./consts.ts"

const getTasks = async () => {
    return fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.getTasks}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    })
    .then(res => res.json())
}

export default getTasks