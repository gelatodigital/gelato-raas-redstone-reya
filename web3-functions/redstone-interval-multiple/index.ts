import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract, ethers } from "ethers";

import * as sdk from "@redstone-finance/sdk";
import { WrapperBuilder } from "@redstone-finance/evm-connector";
const parsePrice = (value: Uint8Array) => {
  const bigNumberPrice = ethers.BigNumber.from(value);
  return bigNumberPrice.toNumber() / 10 ** 8; // Redstone uses 8 decimals
};

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, multiChainProvider, secrets, storage } = context;

  const provider = multiChainProvider.default();

  let abi = [
    "function updateDataFeedsValues(uint256) external",
    "function getDataServiceId() public pure  override returns (string memory)",
    "function getUniqueSignersThreshold() public pure returns (uint8)",
    "function latestRoundData() external view returns (uint80,int256,uint256,int256,uint80)",
    "function decimals() external view returns (uint8)",
  ];

  const priceFeedAdapterAddresses =
    userArgs.priceFeedAdapterAddresses as string[];

  const priceFeeds = userArgs.priceFeeds as string[];
  if (priceFeeds.length == 0) {
    return { canExec: false, message: "No price feed arg" };
  }

  if (priceFeeds.length != priceFeedAdapterAddresses.length) {
    return { canExec: false, message: "PriceFeeds not Matching" };
  }


  let callData:{to:string, data:string}[] = [];

  const getLatestSignedPrice = await sdk.requestDataPackages({
    dataServiceId: "redstone-primary-prod",
    uniqueSignersCount: 2,
    dataFeeds: priceFeeds,
    urls: ["https://oracle-gateway-1.a.redstone.finance"],
  });


  for (let i = 0; i < priceFeeds.length; i++) {
    let priceFeed = priceFeeds[i];
    let  priceFeedAdapterAddress  = priceFeedAdapterAddresses[i]
    const priceFeedAdapter = new Contract(
      priceFeedAdapterAddress,
      abi,
      provider
    );
  
    // Wrap contract with redstone data service
    const wrappedOracle =
      WrapperBuilder.wrap(priceFeedAdapter).usingDataService(
        getLatestSignedPrice
      );

    // Retrieve stored & live prices
 

    const { dataPackage } = getLatestSignedPrice[priceFeed]![0];

    //const parsedPrice = parsePrice(dataPackage.dataPoints[0].value);
    console.log(priceFeedAdapterAddress)
    // Craft transaction to update the price on-chain
    // console.log(
    //   `Setting ${priceFeed} price in PriceFeed contract to: ${parsedPrice}`
    // );

    const { data } =
      await wrappedOracle.populateTransaction.updateDataFeedsValues(
        dataPackage.timestampMilliseconds
      );

  
      callData.push({to:priceFeedAdapterAddress!,data:data!})

  }
  if (callData.length > 0) {
  return {
    canExec: true,
    callData,
  };}
  else {
    return {
      canExec:false,
      message:"No CallData to return"
    }
  }
});
