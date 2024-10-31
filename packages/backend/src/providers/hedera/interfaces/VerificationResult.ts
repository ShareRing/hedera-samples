export enum VerificationLevel {
  Undefined,
  Revoked,
  Checked,
  Verified
}

export interface AttributeVerificationResult {
  verificationLevel: VerificationLevel;
  attributeHashMatched: boolean;
  merkleOnchainMatched: boolean;
  merkleOffchainMatched: boolean;
}

export interface VerificationResult {
  ownerEtheriumAddress: string;
  ownerMatched: boolean;
  attributes: {
    [prop: string]: AttributeVerificationResult;
  };
}
