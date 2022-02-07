import type { VercelRequest, VercelResponse } from "@vercel/node";

import { readFileSync } from "fs";

const text = readFileSync("./package.json", "utf-8");
const { version } = JSON.parse(text);

export default (req: VercelRequest, res: VercelResponse) => {
  res.end(`v${version}`);
};
