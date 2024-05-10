

import * as sdk from "@redstone-finance/sdk";
import { WrapperBuilder} from "@redstone-finance/evm-connector"
import { DataPackagesWrapper} from "@redstone-finance/evm-connector/dist/src/wrappers/DataPackagesWrapper"
import { ethers, deployments, network } from "hardhat";
import { RedstonePriceFeedWithRoundsETH  } from "../typechain";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hre from "hardhat";
 const getLatestSignedPrice = async () => {
  return await sdk.requestDataPackages({
    dataServiceId: "redstone-primary-prod",
    uniqueSignersCount: 3,
    dataFeeds: ["ETH"],
    urls: ["https://oracle-gateway-1.a.redstone.finance"],
  });

};




const parsePrice = (value: Uint8Array) => {
  const bigNumberPrice = ethers.BigNumber.from(value);
  return bigNumberPrice.toNumber() / 10 ** 8; // Redstone uses 8 decimals
};

describe("ClassicModelETH", function () {
  let priceFeedAdapter: RedstonePriceFeedWithRoundsETH;
  let priceFeedAdapterAddress: string;

  let deployer: SignerWithAddress;

  // Set up all contracts
  before(async () => {
    
    [deployer] = await hre.ethers.getSigners()

    
    /// Deploying ETH
    await deployments.fixture()

 

    priceFeedAdapterAddress = (await deployments.get("RedstonePriceFeedWithRoundsETH")).address;
    priceFeedAdapter = (await ethers.getContractAt(
      "RedstonePriceFeedWithRoundsETH",
      priceFeedAdapterAddress
    )) as unknown as RedstonePriceFeedWithRoundsETH;

   
  
  });


  it("Should do a simple independent update", async () => {
  
    const dataPackagesResponse = await getLatestSignedPrice() ;

    if (dataPackagesResponse == undefined){
      return
    }
    const wrappedAdapter =
      WrapperBuilder.wrap(priceFeedAdapter).usingDataPackages(
        dataPackagesResponse
      );
    const { dataPackage } = dataPackagesResponse["ETH"]![0];
  
    const parsedPrice = parsePrice(dataPackage.dataPoints[0].value);
    console.log(`Setting ETH price in PriceFeed contract to: ${parsedPrice}`);
    await wrappedAdapter.updateDataFeedsValues(
      dataPackage.timestampMilliseconds
    );
  });

  it("Should read latest price data", async () => {

    const latestRoundData = await priceFeedAdapter.latestRoundData();
    console.log(`Latest value the ETH Price Feed: ${latestRoundData.answer}`);
  });

});
