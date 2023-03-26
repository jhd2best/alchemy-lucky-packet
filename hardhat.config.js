/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    harmony_testnet: {
      url: "https://api.s0.b.hmny.io",
      chainId: 1666700000,
      gas: 3321900,
      gasPrice: 1000000000,
      accounts: ["0xfc8bc11943e1e30a28ff694ea462ac82b3f2ef04ebc7afe3120dd297a516e7fa"]
    },
    harmony_mainnet: {
      url: "https://api.s0.t.hmny.io",
      chainId: 1666600000,
      gas: 3321900,
      gasPrice: 1000000000,
      accounts: ['your private key here']
    }
  },
  solidity: "0.4.26",
};
