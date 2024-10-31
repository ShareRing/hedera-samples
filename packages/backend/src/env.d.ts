declare namespace NodeJS {
  interface ProcessEnv {
    HEDERA_DID_CONTRACT_ADDRESS: string;
    HEDERA_OPERATOR_PRIVATE_KEY: string;
    HEDERA_RELAY_API_ENDPOINT: string;
  }
}
