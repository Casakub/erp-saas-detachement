"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const port = Number(process.env.PORT ?? 3000);
const server = (0, server_1.createAppServer)();
server.listen(port, () => {
    console.info(`backend substrate listening on :${port}`);
});
