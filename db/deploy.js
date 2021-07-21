// customize hdi deploy
const { deploy } = require("@sap/hdi-deploy/library");
const xsenv = require("@sap/xsenv");
const path = require("path");
const fetch = require("node-fetch");

deploy(
  path.join(__dirname, "./src"),
  {
    VCAP_SERVICES: JSON.stringify({
      hana: xsenv.filterServices({ label: "hana" })
    })
  },
  async (err) => {
    if (err) {
      console.error(err);
    }
    try {
      // call istio sidecar exit
      await fetch("http://localhost:15020/quitquitquit", { method: "POST" });
    } catch (error) {
      console.error(error);
    }

    process.exit(0);
  }
);
