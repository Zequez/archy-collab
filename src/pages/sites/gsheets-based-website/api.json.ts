import url from "url";

const GAUTH_KEY = process.env.GOOGLE_API_KEY;

export async function get({ request: req }: { request: Request }) {
  const reqUrl = url.parse(req.url, true);
  const { id, range } = reqUrl.query;

  if (!id) {
    return new Response(null, {
      status: 400,
      statusText: "Must provide sheet ID",
    });
  }
  const valueQuery = range ? `/values/${range}` : "";

  const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${id}${valueQuery}?key=${GAUTH_KEY}`;
  try {
    const result = await fetch(fetchUrl);
    const data = await result.json();

    return {
      body: JSON.stringify(data),
    };
  } catch (e) {
    console.error(e);
    return new Response(null, {
      status: 500,
      statusText: "Some error making request to Google",
    });
  }
}
