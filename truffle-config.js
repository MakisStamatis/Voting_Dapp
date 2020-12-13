const path = require("path");

module.exports = {
// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!
contracts_build_directory: path.join(__dirname, "client/src/contracts"),
networks: {
   development: {
      network_id: "*",
      host: 'localhost',
      port: 8545,
      gas: 6721975
   }
},
compilers: {
   solc: {
      version:"0.7.5", 
       optimizer: {
          enabled: true,
          runs: 500
       }
   }
}

};