// customize hdi deploy
const { deploy } = require("@sap/hdi-deploy/library");
const xsenv = require("@sap/xsenv");
const path = require("path");

deploy(
  path.join(__dirname, "./src"),
  {
    VCAP_SERVICES: JSON.stringify({
      hana: xsenv.filterServices({ label: "hana" })
    })
  },
  (err, response) => {
    if (err) {
      console.error(err);
    }
  }
);
