import consts from "./consts.ts"

const getHealth = async () => {
    return fetch(`${process.env.REACT_APP_FUNCTIONS_BASE_URL}${consts.routes.health}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(res => res.json())
}

export default getHealth