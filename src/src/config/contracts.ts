export const FUNDRAISER_ADDRESS = '0x0d267E11343206544Ce9e028061215CAb355559f';
export const WETH_ADDRESS = '0xA8a92e63Ab6517b647949F850233dDF18605fCa0';

export const FUNDRAISER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "weth", "type": "address" },
      { "internalType": "string", "name": "name_", "type": "string" },
      { "internalType": "uint64", "name": "targetAmount_", "type": "uint64" },
      { "internalType": "uint64", "name": "endTime_", "type": "uint64" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "CampaignEnded", "type": "error" },
  { "inputs": [], "name": "InvalidEndTime", "type": "error" },
  { "inputs": [], "name": "InvalidToken", "type": "error" },
  { "inputs": [], "name": "NotOwner", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint64", "name": "targetAmount", "type": "uint64" },
      { "indexed": false, "internalType": "uint64", "name": "endTime", "type": "uint64" }
    ],
    "name": "CampaignUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "euint64", "name": "amount", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "ContributionRecorded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint64", "name": "timestamp", "type": "uint64" }
    ],
    "name": "FundraisingEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "euint64", "name": "amount", "type": "bytes32" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "campaignName",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "contributor", "type": "address" }],
    "name": "contributionOf",
    "outputs": [{ "internalType": "euint64", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endFundraising",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endTime",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isEnded",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "euint64", "name": "amount", "type": "bytes32" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "onConfidentialTransferReceived",
    "outputs": [{ "internalType": "ebool", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "targetAmount",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRaised",
    "outputs": [{ "internalType": "euint64", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "name_", "type": "string" },
      { "internalType": "uint64", "name": "targetAmount_", "type": "uint64" },
      { "internalType": "uint64", "name": "endTime_", "type": "uint64" }
    ],
    "name": "updateCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const WETH_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "euint64", "name": "encryptedAmount", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "requester", "type": "address" }
    ],
    "name": "AmountDiscloseRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "euint64", "name": "encryptedAmount", "type": "bytes32" },
      { "indexed": false, "internalType": "uint64", "name": "amount", "type": "uint64" }
    ],
    "name": "AmountDisclosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": true, "internalType": "euint64", "name": "amount", "type": "bytes32" }
    ],
    "name": "ConfidentialTransfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "holder", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "operator", "type": "address" },
      { "indexed": false, "internalType": "uint48", "name": "until", "type": "uint48" }
    ],
    "name": "OperatorSet",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "euint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "uint64", "name": "cleartextAmount", "type": "uint64" },
      { "internalType": "bytes", "name": "decryptionProof", "type": "bytes" }
    ],
    "name": "discloseEncryptedAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confidentialTotalSupply",
    "outputs": [{ "internalType": "euint64", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "confidentialBalanceOf",
    "outputs": [{ "internalType": "euint64", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "euint64", "name": "amount", "type": "bytes32" }
    ],
    "name": "confidentialTransfer",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "externalEuint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "confidentialTransfer",
    "outputs": [{ "internalType": "euint64", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "euint64", "name": "amount", "type": "bytes32" }
    ],
    "name": "confidentialTransferFrom",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "externalEuint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "confidentialTransferFrom",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "euint64", "name": "amount", "type": "bytes32" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "confidentialTransferAndCall",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "externalEuint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "confidentialTransferAndCall",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "euint64", "name": "amount", "type": "bytes32" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "confidentialTransferFromAndCall",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "externalEuint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "confidentialTransferFromAndCall",
    "outputs": [{ "internalType": "euint64", "name": "transferred", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }],
    "name": "isOperator",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint64", "name": "amount", "type": "uint64" }],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "euint64", "name": "encryptedAmount", "type": "bytes32" }],
    "name": "requestDiscloseEncryptedAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "uint48", "name": "until", "type": "uint48" }],
    "name": "setOperator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
    "name": "supportsInterface",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
