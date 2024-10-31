import { HederaSettings } from "../../providers/hedera/interfaces/HederaSettings";

export default <HederaSettings>{
  didContractAddress: process.env.HEDERA_DID_CONTRACT_ADDRESS,
  operatorPrivateKey: process.env.HEDERA_OPERATOR_PRIVATE_KEY,
  relayApiEndpoint: process.env.HEDERA_RELAY_API_ENDPOINT
};
