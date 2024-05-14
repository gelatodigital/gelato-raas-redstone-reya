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
  
 let nowArg = new Date().getTime()
    console.log(nowArg)
  const { taskId, tx } = await automate.cancelTask("0x45a5ce5c513cd30670c706db6fbac49653c5408239218d953569c8e7ec7d3b50")


   await tx.wait()

  console.log(taskId);
 


}
main();
