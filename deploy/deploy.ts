import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedWrapETH = await deploy("WrapETH", {
    from: deployer,
    log: true,
  });

  const now = Math.floor(Date.now() / 1000);
  const endTime = process.env.FUND_END_TIME ? BigInt(process.env.FUND_END_TIME) : BigInt(now + 30 * 24 * 60 * 60);
  const targetAmount = process.env.FUND_TARGET ? BigInt(process.env.FUND_TARGET) : BigInt(1_000_000);
  const campaignName = process.env.FUND_NAME ?? "Cloak Capital Raise";

  const deployedFundraiser = await deploy("CloakFundraiser", {
    from: deployer,
    log: true,
    args: [deployedWrapETH.address, campaignName, targetAmount, endTime],
  });

  console.log(`WrapETH contract: `, deployedWrapETH.address);
  console.log(`CloakFundraiser contract: `, deployedFundraiser.address);
};
export default func;
func.id = "deploy_cloak_fundraiser"; // id required to prevent reexecution
func.tags = ["CloakFundraiser", "WrapETH"];
