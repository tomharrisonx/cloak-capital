import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { CloakFundraiser, CloakFundraiser__factory, WrapETH, WrapETH__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

async function deployFixture() {
  const wrapEthFactory = (await ethers.getContractFactory("WrapETH")) as WrapETH__factory;
  const wrapEth = (await wrapEthFactory.deploy()) as WrapETH;
  const wrapEthAddress = await wrapEth.getAddress();

  const now = Math.floor(Date.now() / 1000);
  const fundraiserFactory = (await ethers.getContractFactory("CloakFundraiser")) as CloakFundraiser__factory;
  const fundraiser = (await fundraiserFactory.deploy(
    wrapEthAddress,
    "Cloak Capital Raise",
    1_000_000,
    now + 7 * 24 * 60 * 60,
  )) as CloakFundraiser;

  return { wrapEth, wrapEthAddress, fundraiser, fundraiserAddress: await fundraiser.getAddress() };
}

describe("CloakFundraiser", function () {
  let signers: Signers;
  let wrapEth: WrapETH;
  let wrapEthAddress: string;
  let fundraiser: CloakFundraiser;
  let fundraiserAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ wrapEth, wrapEthAddress, fundraiser, fundraiserAddress } = await deployFixture());
  });

  it("records encrypted contributions and totals", async function () {
    await wrapEth.connect(signers.deployer).mint(signers.alice.address, 5000);

    const encryptedInput = await fhevm
      .createEncryptedInput(wrapEthAddress, signers.alice.address)
      .add64(1200)
      .encrypt();

    const tx = await wrapEth
      .connect(signers.alice)
      .confidentialTransferAndCall(
        fundraiserAddress,
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        "0x",
      );
    await tx.wait();

    const encryptedContribution = await fundraiser.contributionOf(signers.alice.address);
    const decryptedContribution = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedContribution,
      fundraiserAddress,
      signers.alice,
    );

    const encryptedTotal = await fundraiser.totalRaised();
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotal,
      fundraiserAddress,
      signers.deployer,
    );

    expect(decryptedContribution).to.eq(1200);
    expect(decryptedTotal).to.eq(1200);
  });

  it("rejects contributions after the campaign ends", async function () {
    await fundraiser.connect(signers.deployer).endFundraising();

    await wrapEth.connect(signers.deployer).mint(signers.alice.address, 5000);
    const encryptedInput = await fhevm
      .createEncryptedInput(wrapEthAddress, signers.alice.address)
      .add64(1000)
      .encrypt();

    const tx = await wrapEth
      .connect(signers.alice)
      .confidentialTransferAndCall(
        fundraiserAddress,
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        "0x",
      );
    await tx.wait();

    const encryptedContribution = await fundraiser.contributionOf(signers.alice.address);
    expect(encryptedContribution).to.eq(ethers.ZeroHash);
  });
});
