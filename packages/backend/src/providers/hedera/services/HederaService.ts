import { Constant, Inject, InjectorService, Service } from "@tsed/di";
import { Logger } from "@tsed/logger";
import { BinaryLike, BinaryToTextEncoding, createHash } from "crypto";
import { Contract, ethers, JsonRpcProvider, Wallet } from "ethers";
import MerkleTree from "merkletreejs";
import { SessionRepository } from "../../../repositories";
import abi from "../abi/VerifiableCredentialsToken.json";
import { HederaSettings } from "../interfaces/HederaSettings";
import { StartVerification } from "../interfaces/StartVerification";
import { VerificationLevel, VerificationResult } from "../interfaces/VerificationResult";

@Service()
export class HederaService implements StartVerification {
  @Constant("hedera")
  private readonly hederaSettings: HederaSettings;

  @Inject(Logger)
  private readonly logger: Logger;

  @Inject(InjectorService)
  private readonly injector: InjectorService;

  @Inject(SessionRepository)
  private readonly sessionRepository: SessionRepository;

  provider: JsonRpcProvider;
  signer: Wallet;
  contract: Contract;

  $onInit() {
    this.provider = new ethers.JsonRpcProvider(this.hederaSettings.relayApiEndpoint);
    this.signer = new ethers.Wallet(this.hederaSettings.operatorPrivateKey, this.provider);
    this.contract = new ethers.Contract(this.hederaSettings.didContractAddress, abi, this.signer);
  }

  async getAttributesData(tokenId: string, attrNameHash: string) {
    const gasPrice = await this.provider.getFeeData().then((res) => res.gasPrice!);
    const estimatedGas = await this.contract.getAttributesData.estimateGas(tokenId, Buffer.from(attrNameHash, "hex"));
    const contractQueryResult = await this.contract.getAttributesData(tokenId, Buffer.from(attrNameHash, "hex"), {
      gasLimit: estimatedGas,
      gasPrice
    });

    this.logger.info("getAttributesData", contractQueryResult);
    const [level] = contractQueryResult;
    return level as VerificationLevel;
  }

  async getMekleRoot(tokenId: string) {
    const gasPrice = await this.provider.getFeeData().then((res) => res.gasPrice!);
    const estimatedGas = await this.contract.getMerkleRoot.estimateGas(tokenId);
    const contractQueryResult = await this.contract.getMerkleRoot(tokenId, {
      gasLimit: estimatedGas,
      gasPrice
    });

    // NOTE, merkleRoot is returned in 0x... format
    return Buffer.from(ethers.getBytes(contractQueryResult)).toString("hex");
  }

  async ownerOf(tokenId: string) {
    let gasPrice = await this.provider.getFeeData().then((res) => res.gasPrice!);
    let estimatedGas = await this.contract.didTokenIdToTokenId.estimateGas(tokenId);
    const contractQueryResult1 = await this.contract.didTokenIdToTokenId(tokenId, {
      gasLimit: estimatedGas,
      gasPrice
    });
    const erc721TokenId = ethers.toBigInt(contractQueryResult1);
    estimatedGas = await this.contract.ownerOf.estimateGas(erc721TokenId);
    const contractQueryResult2 = await this.contract.ownerOf(erc721TokenId, {
      gasLimit: estimatedGas,
      gasPrice
    });
    return contractQueryResult2 as string;
  }

  async verifyAttribute(tokenId: string, attrValueHash: string, proofs: string[]) {
    const gasPrice = await this.provider.getFeeData().then((res) => res.gasPrice!);
    const estimatedGas = await this.contract.verifyAttribute.estimateGas(
      tokenId,
      Buffer.from(attrValueHash, "hex"),
      proofs.map((p) => Buffer.from(p, "hex"))
    );
    const contractQueryResult = await this.contract.verifyAttribute(
      tokenId,
      Buffer.from(attrValueHash, "hex"),
      proofs.map((p) => Buffer.from(p, "hex")),
      {
        gasLimit: estimatedGas,
        gasPrice
      }
    );

    this.logger.info("verifyAttribute", contractQueryResult);
    return contractQueryResult as boolean;
  }

  async $startVerification(sessionId: string, attributes: any) {
    const session = await this.sessionRepository.find({ uuid: sessionId });
    if (!session) {
      return;
    }
    // verification
    // this can also be done on the frontend side
    // fields name.verified, date_of_birth.verified, ShareLedger_Address, nationality.verified, vct

    try {
      const verificationResult: VerificationResult = {
        ownerMatched: false,
        ownerEtheriumAddress: "",
        attributes: {}
      };

      // extract attributes, take vct token id (did) and addresses
      const { vct, ShareLedger_Address: shareledgerAddress, Matic_Address: ethereumAddress, ...rest } = attributes;

      // 1. check token owner
      const ownerEtheriumAddress = await this.ownerOf(vct);
      verificationResult.ownerEtheriumAddress = ownerEtheriumAddress;
      verificationResult.ownerMatched = ethereumAddress.toLowerCase() === ownerEtheriumAddress.toLowerCase();

      // get merkle root
      const merkleRoot = await this.getMekleRoot(vct);

      for (const k of Object.keys(rest)) {
        let attrName = k;

        const attrNameArr = k.split(".");
        if (attrNameArr.length === 1) {
          // <attr>
          attrName = k;
        } else if (attrNameArr.length < 3) {
          // <attr>.<level>
          attrName = attrNameArr[0];
        } else {
          // <doc>.<attr>.<level>.<something>...
          attrName = attrNameArr[1];
        }

        verificationResult.attributes[attrName] = {
          attributeHashMatched: false,
          merkleOffchainMatched: false,
          merkleOnchainMatched: false,
          verificationLevel: VerificationLevel.Undefined
        };
        // parse attribute value
        const [attrValue, attrValueHashFromDevice, proofs] = JSON.parse(rest[k]);

        let attrNameHash;
        let attrValueHash;

        if (Array.isArray(attrValue)) {
          const [countryCode, docType, value] = attrValue;
          attrNameHash = sha256(`${countryCode.toLowerCase()}.${docType.toLowerCase()}.${attrName}`, "hex");
          attrValueHash = sha256(`${countryCode.toLowerCase()}.${docType.toLowerCase()}.${attrName}.${value}`, "hex");
        } else {
          attrNameHash = sha256(`${attrName}`, "hex");
          attrValueHash = sha256(`${attrName}.${attrValue}`, "hex");
        }

        // 2. check attribute hash
        if (attrValueHashFromDevice === attrValueHash) {
          verificationResult.attributes[attrName].attributeHashMatched = true;
        }

        // 3. verify proofs off chain
        const merkleTree = new MerkleTree([], sha256, { sort: true }); // sort: true is required to match with the implementation on contracts
        verificationResult.attributes[attrName].merkleOffchainMatched = merkleTree.verify(proofs, attrValueHash, merkleRoot);

        const [level, verified] = await Promise.all([
          // get verification level
          this.getAttributesData(vct, attrNameHash),
          // 4. verify proofs on chain
          this.verifyAttribute(vct, attrValueHash, proofs)
        ]);

        verificationResult.attributes[attrName].verificationLevel = level;
        verificationResult.attributes[attrName].merkleOnchainMatched = verified;
      }

      session.verificationResult = verificationResult;

      this.logger.info("Verification finished");
    } catch (err) {
      this.logger.error(err);
    } finally {
      session.status = "completed";
      await this.sessionRepository.save(session);
    }
  }
}

function sha256(value: BinaryLike): Buffer;
function sha256(value: BinaryLike, encoding: BinaryToTextEncoding): string;
function sha256(value: BinaryLike, encoding?: BinaryToTextEncoding) {
  const hash = createHash("sha256").update(value);
  return encoding ? hash.digest(encoding) : hash.digest();
}
