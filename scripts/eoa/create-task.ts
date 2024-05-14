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

  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(chainId)
  const automate = new AutomateSDK(chainId, deployer);
  const cid="QmYHSJ4oyV9WuyUtwSkYNaC3kDHUejyvWfKujCGqnWE3rr"
  

  const { taskId, tx } = await automate.createBatchExecTask({
    name: "Web3Function - Reya ETH",
    web3FunctionHash: cid,
    web3FunctionArgs: { 
     "priceFeed":"ETH",
    "priceFeedAdapterAddress":"0xFBA40360559a1bcCC608d9cA07deDE8588460874"
    },
    trigger: {
      interval: 10 * 1000,
      type: TriggerType.TIME
    },
  });

  console.log(taskId)

 


}
main();
