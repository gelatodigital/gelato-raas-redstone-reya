import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract, ethers } from "ethers";


Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, multiChainProvider, secrets, storage } = context;

  const provider = multiChainProvider.default();
  const counter = "0x00172f67db60E5fA346e599cdE675f0ca213b47b"; 
  const abi = ["function increment()"];
      // Generate the target payload
      const contract = new ethers.Contract(counter, abi, provider);
      const { data } = await contract.populateTransaction.increment();

    return {
      canExec: true,
      callData: [{ to: counter, data: data as string }],
    };


});
