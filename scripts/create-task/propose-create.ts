import hre from "hardhat";

import Safe, {
  EthersAdapter,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import SafeApiKit from "@safe-global/api-kit";
import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";
import { safeAddress } from "../safe";
import { task } from "hardhat/config";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: deployer,
  });


  const protocolKit = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const predictedSafeAddress =
    await protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed =
    await protocolKit.isSafeDeployed();
  console.log({ isSafeDeployed });


  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(chainId)
  const automate = new AutomateSDK(chainId, deployer);
  const cid="QmNoYbExG1qTEG3v9E6b7mKhmCFr32M1NxpdmzTQrWZMqr"
  

 
  const { taskId, tx } = await automate.prepareBatchExecTask({
    name: "Web3Function - Reya Multiple",
    web3FunctionHash: cid,
    web3FunctionArgs: { 
      // "priceFeeds":["ETH", "BTC", "WBTC", "USDC", "USDT", "DAI" ],
      //"priceFeedAdapterAddresses":["0xa7fca6F37eCA129409af5d9d88e015De51C4aff3","0xc7021763f59F1E3081a36589b701e6928F119961","0xB50CA437B949e9496C4674B20F1D5dd597c59027", "0xCe05AcdD57f1f2e8666386ea7Ed20504a63D0700","0x260aADC4E51D4ECA2f3Aa998AffC1f9becC110b8","0xc2E00Dea3cc483e057519D1df9d313EF2a52C1Ae"]
      "priceFeed":"BTC",
      "priceFeedAdapterAddress":"0xc7021763f59F1E3081a36589b701e6928F119961"
    },
    trigger: {
      interval: 11 * 1000,
      type: TriggerType.TIME,
    },
  });




  const txServiceUrl = 'https://transaction.safe.reya.network'
  const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })

  const safeTransactionData: MetaTransactionData = {
    to: tx.to,
    data: tx.data,
    value: "0",
    operation: OperationType.Call,
  };

    // Propose transaction to the service 
  const safeTransaction = await protocolKit.createTransaction({ safeTransactionData })
  const senderAddress = await deployer.getAddress()
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
  const signature = await protocolKit.signTransactionHash(safeTxHash)
  await service.proposeTransaction({
    safeAddress: safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress ,
    senderSignature: signature.data
  })

  console.log('Proposed a transaction with Safe:', safeAddress)
  console.log('- safeTxHash:', safeTxHash)
  console.log('- Sender:', senderAddress)
  console.log('- Sender signature:', signature.data)
  console.log('- TaskId:', taskId)

}
main();
