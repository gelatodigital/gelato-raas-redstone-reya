import hre from "hardhat";

import Safe, {
  EthersAdapter,
  SafeFactory,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import ContractInfo from "./ABI.json";
import SafeApiKit from "@safe-global/api-kit";
import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";

const { ethers, w3f } = hre;

const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
let RPC_URL = `https://rpc.ankr.com/eth_sepolia`;


interface Config {
  CHAIN_ID: bigint
  RPC_URL: string
  SIGNER_ADDRESS_PRIVATE_KEY: string
  SAFE_ADDRESS: string
}
const config: Config = {
  CHAIN_ID: 11155111n,
  RPC_URL: 'https://rpc.ankr.com/eth_sepolia',
  SIGNER_ADDRESS_PRIVATE_KEY:process.env.PK!,
  SAFE_ADDRESS: '0x6b594E0eD457654FD3F129de134d343ab3bf8957'
}


// let targetAddress = ContractInfo.address;
// const nftContract = new ethers.Contract(
//   targetAddress,
//   ContractInfo.abi,
//   deployer
// );

const gasLimit = "100000000";

async function relayTransaction() {

  let provider = hre.ethers.provider;
  const [deployer] = await ethers.getSigners(); 

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: deployer,
  });

  let safeAddress = "0x6b594E0eD457654FD3F129de134d343ab3bf8957";

  // try {
  //   const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });

  //   const safeAccountConfig: SafeAccountConfig = {
  //     owners: [await signer.getAddress()],
  //     threshold: 1,
  //   };

  //   /* This Safe is tied to owner 1 because the factory was initialized with
  // an adapter that had owner 1 as the signer. */

  //   const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

  //   safeAddress = await safeSdkOwner1.getAddress();
  // } catch (error) {}

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

  //  // Create Safe API Kit instance
  //  const service = new SafeApiKit({
  //   chainId: config.CHAIN_ID
  // })
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const automate = new AutomateSDK(chainId, deployer);
  const cid="QmZ3qp2KR43NTzvqcLYzEDajspP2rUzJq9FuFvD3LLDR99"
  
 const {tx,taskId} = await automate.prepareCancelTask("0x47c59b6438c81366ba378baa3de284fa15e1c3f1b0294cc3c53db1e168d263ea")

  // const { taskId, tx } = await automate.prepareBatchExecTask({
  //   name: "Web3Function - Reya Multiple",
  //   web3FunctionHash: cid,
  //   web3FunctionArgs: { 
  //     "priceFeeds":["ETH", "BTC", "WBTC", "USDC", "USDT", "DAI" ],
  //     "priceFeedAdapterAddresses":["0xFb49001366fC0b23B4892909426bd3796958b6D4","0x34e8C1929Abb778358202Ea061eaE6f8a88dcA6A","0x1Db3251c664De5990A31518fecA26189d39E0191", "0xBf356E1d7D083E9439A50D38430713BeE7F05a4c","0xB3315A412c0DD59Ff4F040106FC1dE43e9528947","0x201a385ce2a2fcDFd190DaB925B3AB1F9E11ab60"]
  //     },
  //   trigger: {
  //     interval: 10 * 1000,
  //     type: TriggerType.TIME,
  //   },
  // },{},safeAddress);
  //  console.log(tx)
 
 console.log(taskId)

  const txServiceUrl = 'https://safe-transaction-sepolia.safe.global'
  const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })

  const safeTransactionData: MetaTransactionData = {
    to: tx.to,
    data: tx.data,
    value: "0",
    operation: OperationType.Call,
  };

  // const safeTransaction = await protocolKit.createTransaction({ safeTransactionData })
  // const senderAddress = await deployer.getAddress()
  // const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
  // const signature = await protocolKit.signTransactionHash(safeTxHash)
  // await service.proposeTransaction({
  //   safeAddress: config.SAFE_ADDRESS,
  //   safeTransactionData: safeTransaction.data,
  //   safeTxHash,
  //   senderAddress ,
  //   senderSignature: signature.data
  // })

  // console.log('Proposed a transaction with Safe:', config.SAFE_ADDRESS)
  // console.log('- safeTxHash:', safeTxHash)
  // console.log('- Sender:', senderAddress)
  // console.log('- Sender signature:', signature.data)

 //const response = await service.confirmTransaction(safeTxHash, signature.data)

   const safeTransaction = await service.getTransaction("0xa48f437b111c42138527b9b9995ed9da49369f91cedfbe02c784b403841c69f4")
  const executeTxResponse = await protocolKit.executeTransaction(safeTransaction)
 const receipt = await executeTxResponse.transactionResponse?.wait()
  console.log(receipt)
  // Propose transaction to the service

}
relayTransaction();
