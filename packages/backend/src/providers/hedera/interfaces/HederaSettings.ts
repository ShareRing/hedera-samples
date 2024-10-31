export interface HederaSettings {
  operatorPrivateKey: string;
  relayApiEndpoint: string;
  didContractAddress: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace TsED {
    interface Configuration {
      hedera?: HederaSettings;
    }
  }
}
