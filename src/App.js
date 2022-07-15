import "./App.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  CHAINS,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  GAS_LIMIT,
} from "./config";

function App() {
  const [address, setAddress] = useState('');
  const [wallet, setWallet] = useState();
  const [connected, setConnected] = useState(false);
  let provider = new ethers.providers.Web3Provider(window.ethereum)
  let signer = provider.getSigner()
  let contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  )

  // const isOwner = async ({ _addr }) => {
  //   let _owner = await contract.functions.owner()
  //   return _addr === _owner
  // }

  const connectWallet = async () => {
    try {
      const _wallet = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(_wallet[0]);

      // check if user is owner
      // if (!await isOwner(_wallet[0])) {
      //   setConnected(false)
      //   alert('You are not the contract owner!')
      //   return
      // }
      setConnected(true)

    }
    catch (e) {
      alert("Could not connect. Try again")
    }
  };

  const isAddressValid = () => {
    return ethers.utils.isAddress(address);
  };

  const convertToETH = (num) => {
    return ethers.utils.formatEther(num)
  }

  const airdrop = async () => {
    if (!isAddressValid()) {
      alert('Enter a valid Ethereum wallet address')
      return
    }

    let _mintPrice = await contract.functions.getMintPrice()
    let newPrice = (1 * convertToETH(_mintPrice.toString())).toFixed(2)
    let newGasLimit = GAS_LIMIT

    const tx = await contract.mint(1, {
      value: ethers.utils.parseEther(newPrice.toString()),
      gasLimit: newGasLimit
    })

    let txReceipt = await tx.wait()
    console.log('txReceipt', txReceipt)
  };

  return (
    <div className="App">
      <main>
        <div className="content">
          <h1>NFT AIRDROPPER</h1>
          {!connected ? (
            <div>
              <button onClick={connectWallet}>Connect your wallet</button>
            </div>
          ) : (
            <div>
              <div className="input-container">
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Wallet address"
                />
                <button onClick={airdrop}>airdrop!</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
