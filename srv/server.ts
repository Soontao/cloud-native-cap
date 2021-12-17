import cds from "@sap/cds";
import "reflect-metadata";

cds.on("bootstrap", async () => {});

module.exports = cds.server;
