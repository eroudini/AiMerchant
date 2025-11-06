import { createApp } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT || 4000);

async function main() {
  const app = createApp();
  app.listen(port, () => {
    console.log(`[server] AIMerchant API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("[server] fatal", err);
  process.exit(1);
});
