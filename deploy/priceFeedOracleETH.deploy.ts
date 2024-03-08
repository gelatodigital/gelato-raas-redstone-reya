import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying PriceFeedOracleWithAdapter to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const adapterETH= await deploy("RedstonePriceFeedWithRoundsETH", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    proxy: {
      proxyContract: "EIP173Proxy",
    },
  });
  console.log(
    `Deployed Price Feed ETH to ${adapterETH.address}`
  );


};

export default func;

func.tags = ["ETHWR"];

