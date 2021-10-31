import Web3 from "web3";
import config from './config';

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and injected Web3 is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* web3 is not injected into the browser.
  const provider = new Web3.providers.HttpProvider(config.infuraKey);
  web3 = new Web3(provider);
}

export default web3;