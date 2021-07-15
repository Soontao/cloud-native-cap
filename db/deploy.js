
const xsenv = require("@sap/xsenv")

// polyfill for cloud native projects
process.env.VCAP_SERVICES = JSON.stringify({ 
  hana: xsenv.filterServices({ label: "hana" })
})

require("@sap/hdi-deploy/deploy")
