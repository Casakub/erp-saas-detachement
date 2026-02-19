import { createAppServer } from "./server";

const port = Number(process.env.PORT ?? 3000);
const server = createAppServer();

server.listen(port, () => {
  console.info(`backend substrate listening on :${port}`);
});
