import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployments, ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { CloakFundraiser, WrapETH } from "../types";

type Signers = {
  operator: HardhatEthersSigner;
};

describe("CloakFundraiserSepolia", function () {
  let signers: Signers;
  let fundraiser: CloakFundraiser;
  let fundraiserAddress: string;
  let wrapEth: WrapETH;
  let wrapEthAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const fundraiserDeployment = await deployments.get("CloakFundraiser");
      fundraiserAddress = fundraiserDeployment.address;
      fundraiser = await ethers.getContractAt("CloakFundraiser", fundraiserDeployment.address);

      const wrapEthDeployment = await deployments.get("WrapETH");
      wrapEthAddress = wrapEthDeployment.address;
      wrapEth = await ethers.getContractAt("WrapETH", wrapEthDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { operator: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("prints campaign metadata and decrypts totals when allowed", async function () {
    steps = 6;

    this.timeout(4 * 40000);

    progress("Loading campaign metadata...");
    const [name, target, endTime, owner, ended] = await Promise.all([
      fundraiser.campaignName(),
      fundraiser.targetAmount(),
      fundraiser.endTime(),
      fundraiser.owner(),
      fundraiser.isEnded(),
    ]);

    expect(name.length).to.be.greaterThan(0);
    expect(target).to.be.greaterThan(0);
    expect(endTime).to.be.greaterThan(0);
    console.log(`Owner: ${owner} Ended: ${ended}`);

    if (owner.toLowerCase() !== signers.operator.address.toLowerCase()) {
      console.log("Skipping total decryption because signer is not the owner.");
      return;
    }

    progress("Decrypting encrypted total...");
    const encryptedTotal = await fundraiser.totalRaised();
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotal,
      fundraiserAddress,
      signers.operator,
    );
    console.log(`Clear total: ${decryptedTotal}`);
  });

  it("allows a live contribution when campaign is active", async function () {
    steps = 8;

    this.timeout(4 * 60000);

    progress("Checking campaign state...");
    const isActive = await fundraiser.isActive();
    if (!isActive) {
      console.log("Campaign is not active; skipping contribution test.");
      return;
    }

    progress("Minting test wETH...");
    const mintTx = await wrapEth.connect(signers.operator).mint(signers.operator.address, 2500);
    await mintTx.wait();

    progress("Encrypting contribution...");
    const encryptedInput = await fhevm
      .createEncryptedInput(wrapEthAddress, signers.operator.address)
      .add64(500)
      .encrypt();

    progress("Submitting contribution...");
    const tx = await wrapEth
      .connect(signers.operator)
      .confidentialTransferAndCall(
        fundraiserAddress,
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        "0x",
      );
    await tx.wait();

    progress("Decrypting contributor total...");
    const encryptedContribution = await fundraiser.contributionOf(signers.operator.address);
    const decryptedContribution = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedContribution,
      fundraiserAddress,
      signers.operator,
    );
    console.log(`Clear contribution: ${decryptedContribution}`);
  });
});
