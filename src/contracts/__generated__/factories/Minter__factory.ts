/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Minter, MinterInterface } from "../Minter";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        name: "gauge",
        type: "address",
      },
      {
        indexed: false,
        name: "minted",
        type: "uint256",
      },
    ],
    name: "Minted",
    type: "event",
  },
  {
    inputs: [
      {
        name: "_token",
        type: "address",
      },
      {
        name: "_controller",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
    name: "constructor",
  },
  {
    inputs: [
      {
        name: "gauge_addr",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "gauge_addrs",
        type: "address[8]",
      },
    ],
    name: "mint_many",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "gauge_addr",
        type: "address",
      },
      {
        name: "_for",
        type: "address",
      },
    ],
    name: "mint_for",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "minting_user",
        type: "address",
      },
    ],
    name: "toggle_approve_mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "controller",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
        type: "address",
      },
    ],
    name: "minted",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
        type: "address",
      },
    ],
    name: "allowed_to_mint_for",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class Minter__factory {
  static readonly abi = _abi;
  static createInterface(): MinterInterface {
    return new utils.Interface(_abi) as MinterInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Minter {
    return new Contract(address, _abi, signerOrProvider) as Minter;
  }
}
