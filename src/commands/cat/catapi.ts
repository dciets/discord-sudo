import fetch from "node-fetch";

export const search = (qs: { [key: string]: any }) =>
    fetch(
        `https://api.thecatapi.com/v1/images/search?mime_types=jpg,png&size=med&${new URLSearchParams(
            qs
        ).toString()}`,
        {
            headers: { "X-API-KEY": process.env.CAT_APIKEY || "" },
        }
    ).then((r) => r.json());

export const categories = () =>
    fetch(`https://api.thecatapi.com/v1/categories`, {
        headers: { "X-API-KEY": process.env.CAT_APIKEY || "" },
    }).then((r) => r.json());
