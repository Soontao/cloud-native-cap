#!/bin/bash node
// usage:
// cf service-key [service-name] [key-name] | node scripts/to_secret.js

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

read(process.stdin)
  .then((inbound) => {
    const serviceName = /^Getting key.*?for service instance (.*?) .*?\.\.\.$/gm.exec(inbound)[1];
    console.log(`---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: ${serviceName}
data:`);
    inbound = inbound.replace(/^Getting key.*?for service instance.*?\.\.\.$/gm, "");
    const secrets = JSON.parse(inbound);
    for (const [key, value] of Object.entries(secrets)) {
      console.log(`  ${key}: ${Buffer.from(value, "utf-8").toString("base64")}`);
    }
  })
  .catch((error) => {
    console.error("failed");
    console.error(error);
  });
