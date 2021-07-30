var VerifierSSI = artifacts.require("./VerifierSSI.sol");

module.exports = function (deployer) {
    deployer.deploy(VerifierSSI);
};
