export const contractConfig = {
    address: process.env.VUE_APP_CONTRACT_ADDRESS,
    url: {
      'development': 'https://goerli.infura.io/v3/',
      'production': 'https://mainnet.infura.io/v3/'
    },
    abi: [
        {
          "constant": true,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            },
            {
              "name": "_addrs",
              "type": "address[]"
            }
          ],
          "name": "getClaimAmount",
          "outputs": [
            {
              "name": "",
              "type": "uint256[]"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "initialized",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            },
            {
              "name": "seed",
              "type": "uint256"
            }
          ],
          "name": "claimSeedPacket",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_newStep",
              "type": "uint256"
            }
          ],
          "name": "setDiscountStep",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "token",
              "type": "address"
            },
            {
              "name": "secret",
              "type": "string"
            },
            {
              "name": "packetType",
              "type": "uint8"
            },
            {
              "name": "packetAmount",
              "type": "uint256"
            },
            {
              "name": "packetCount",
              "type": "uint8"
            }
          ],
          "name": "sendSecretPacket",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "",
              "type": "address"
            },
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "userPackets",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "secret",
              "type": "string"
            }
          ],
          "name": "getSecretPacketId",
          "outputs": [
            {
              "name": "",
              "type": "uint32"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "",
              "type": "address"
            }
          ],
          "name": "blackList",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "_customer",
              "type": "address"
            }
          ],
          "name": "currentFee",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            },
            {
              "name": "secret",
              "type": "string"
            }
          ],
          "name": "claimSecretPacket",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_newStep",
              "type": "uint256"
            }
          ],
          "name": "setFee",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "setBlackList",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "unsetBlackList",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            }
          ],
          "name": "getPacketAddresses",
          "outputs": [
            {
              "name": "",
              "type": "address[]"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "name": "",
              "type": "address"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "token",
              "type": "address"
            },
            {
              "name": "seed",
              "type": "uint256"
            },
            {
              "name": "packetType",
              "type": "uint8"
            },
            {
              "name": "packetAmount",
              "type": "uint256"
            },
            {
              "name": "packetCount",
              "type": "uint8"
            }
          ],
          "name": "sendSeedPacket",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "user",
              "type": "address"
            }
          ],
          "name": "getUserPackets",
          "outputs": [
            {
              "name": "",
              "type": "uint256[]"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "arrayLimit",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            }
          ],
          "name": "claimMyPacket",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "customer",
              "type": "address"
            }
          ],
          "name": "txCount",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "initialize",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "packets",
          "outputs": [
            {
              "name": "token",
              "type": "address"
            },
            {
              "name": "owner",
              "type": "address"
            },
            {
              "name": "packetId",
              "type": "uint32"
            },
            {
              "name": "packetType",
              "type": "uint8"
            },
            {
              "name": "packetAmount",
              "type": "uint256"
            },
            {
              "name": "packetCount",
              "type": "uint8"
            },
            {
              "name": "claimCount",
              "type": "uint256"
            },
            {
              "name": "remainAmount",
              "type": "uint256"
            },
            {
              "name": "remainCount",
              "type": "uint256"
            },
            {
              "name": "maxAddress",
              "type": "address"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            }
          ],
          "name": "getPacketAmounts",
          "outputs": [
            {
              "name": "",
              "type": "uint256[]"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "getMyPackets",
          "outputs": [
            {
              "name": "",
              "type": "string[]"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "fee",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_token",
              "type": "address"
            }
          ],
          "name": "claimTokens",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "discountStep",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "_newLimit",
              "type": "uint256"
            }
          ],
          "name": "setArrayLimit",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "_customer",
              "type": "address"
            }
          ],
          "name": "discountRate",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "seed",
              "type": "uint256"
            }
          ],
          "name": "getSeedPacketId",
          "outputs": [
            {
              "name": "",
              "type": "uint32"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "packetId",
              "type": "uint32"
            },
            {
              "name": "user",
              "type": "address"
            }
          ],
          "name": "getMyAmount",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "payable": true,
          "stateMutability": "payable",
          "type": "fallback"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "total",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "tokenAddress",
              "type": "address"
            }
          ],
          "name": "Packetstarted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "amount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "token",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "packetId",
              "type": "uint32"
            },
            {
              "indexed": false,
              "name": "user",
              "type": "address"
            }
          ],
          "name": "PacketClaimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "total",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "tokenAddress",
              "type": "address"
            }
          ],
          "name": "Packetended",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "token",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "balance",
              "type": "uint256"
            }
          ],
          "name": "ClaimedTokens",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "packetid",
              "type": "uint32"
            },
            {
              "indexed": false,
              "name": "token",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "balance",
              "type": "uint256"
            }
          ],
          "name": "ClaimedPacketTokens",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        }
    ],
    defaultGasPrice: '0.0005',
    defaultGasLimit: '1000000',
}
