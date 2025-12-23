import { task } from "hardhat/config";
import { FhevmType } from "@fhevm/hardhat-plugin";
import type { TaskArguments } from "hardhat/types";

task("fundraiser:address", "Prints the CloakFundraiser and WrapETH addresses").setAction(
  async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const fundraiser = await deployments.get("CloakFundraiser");
    const wrapEth = await deployments.get("WrapETH");

    console.log(`CloakFundraiser address is ${fundraiser.address}`);
    console.log(`WrapETH address is ${wrapEth.address}`);
  },
);

task("fundraiser:status", "Prints campaign metadata and encrypted totals")
  .addOptionalParam("address", "Optionally specify the CloakFundraiser contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers } = hre;

    const fundraiserDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CloakFundraiser");

    const fundraiser = await ethers.getContractAt("CloakFundraiser", fundraiserDeployment.address);

    const [name, target, endTime, owner, isEnded, token] = await Promise.all([
      fundraiser.campaignName(),
      fundraiser.targetAmount(),
      fundraiser.endTime(),
      fundraiser.owner(),
      fundraiser.isEnded(),
      fundraiser.token(),
    ]);

    console.log(`Campaign name: ${name}`);
    console.log(`Target amount: ${target}`);
    console.log(`End time     : ${endTime}`);
    console.log(`Owner        : ${owner}`);
    console.log(`Token        : ${token}`);
    console.log(`Ended        : ${isEnded}`);
  });

task("fundraiser:contribute", "Submits an encrypted contribution using WrapETH")
  .addParam("amount", "Contribution amount (uint64)")
  .addOptionalParam("address", "Optionally specify the CloakFundraiser contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers, fhevm } = hre;

    const amount = BigInt(taskArguments.amount);
    if (amount <= 0n) {
      throw new Error(`Argument --amount must be greater than zero`);
    }

    await fhevm.initializeCLIApi();

    const fundraiserDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CloakFundraiser");
    const wrapEthDeployment = await deployments.get("WrapETH");

    const signers = await ethers.getSigners();
    const contributor = signers[0];

    const wrapEth = await ethers.getContractAt("WrapETH", wrapEthDeployment.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(wrapEthDeployment.address, contributor.address)
      .add64(amount)
      .encrypt();

    const tx = await wrapEth
      .connect(contributor)
      .confidentialTransferAndCall(
        fundraiserDeployment.address,
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        "0x",
      );
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("fundraiser:decrypt-total", "Decrypts total raised amount for the caller")
  .addOptionalParam("address", "Optionally specify the CloakFundraiser contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const fundraiserDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CloakFundraiser");

    const fundraiser = await ethers.getContractAt("CloakFundraiser", fundraiserDeployment.address);
    const encryptedTotal = await fundraiser.totalRaised();

    const signers = await ethers.getSigners();
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotal,
      fundraiserDeployment.address,
      signers[0],
    );

    console.log(`Encrypted total: ${encryptedTotal}`);
    console.log(`Clear total    : ${decryptedTotal}`);
  });

task("fundraiser:decrypt-contribution", "Decrypts a contributor's recorded amount")
  .addParam("contributor", "Contributor address")
  .addOptionalParam("address", "Optionally specify the CloakFundraiser contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const fundraiserDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CloakFundraiser");

    const fundraiser = await ethers.getContractAt("CloakFundraiser", fundraiserDeployment.address);
    const encryptedContribution = await fundraiser.contributionOf(taskArguments.contributor);

    const signers = await ethers.getSigners();
    const decryptedContribution = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedContribution,
      fundraiserDeployment.address,
      signers[0],
    );

    console.log(`Encrypted contribution: ${encryptedContribution}`);
    console.log(`Clear contribution    : ${decryptedContribution}`);
  });
