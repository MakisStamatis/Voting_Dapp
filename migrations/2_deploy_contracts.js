var VoteContract = artifacts.require("./VoteContract.sol");

module.exports = function(deployer) {

deployer.deploy(VoteContract);

};