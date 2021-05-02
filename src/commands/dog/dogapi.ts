import fetch from "node-fetch";

export const search = (qs: { [key: string]: any }) =>
  fetch(
    `https://api.thedogapi.com/v1/images/search?mime_types=jpg,png&size=med&${new URLSearchParams(
      qs
    ).toString()}`,
    {
      headers: { "X-API-KEY": process.env.DOG_APIKEY || "" },
    }
  ).then((r) => r.json());

export const breeds = () =>
  fetch(`https://api.thedogapi.com/v1/breeds`, {
    headers: { "X-API-KEY": process.env.DOG_APIKEY || "" },
  }).then((r) => r.json());
