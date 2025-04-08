import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  error?: string;
};

// Support for page param to be added at later date due to TVmaze limitation

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const query = req.body.query;

  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'query' parameter" });
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `TVmaze API error: ${response.statusText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Fetch failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
