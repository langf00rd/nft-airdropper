import "./App.css";
import { ethers } from "ethers";
import { useState } from "react";
import {
  CHAINS,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  GAS_LIMIT,
} from "./config";

function App() {
  const [address, setAddress] = useState('');
  // const [wallet, setWallet] = useState();
  const [loading, setLoading] = useState(false);
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
      setLoading(true)
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // setWallet(_wallet[0]);
      // check if user is owner
      // if (!await isOwner(_wallet[0])) {
      //   setConnected(false)
      //   alert('You are not the contract owner!')
      //   return
      // }

      setConnected(true)
      setLoading(false)
    } catch (e) {
      alert("Could not connect. Try again")
      setLoading(false)
    }
  };

  const isAddressValid = () => {
    return ethers.utils.isAddress(address);
  };

  const convertToETH = (num) => {
    return ethers.utils.formatEther(num)
  }

  const airdrop = async () => {
    try {

      // check if address is valid
      if (!isAddressValid()) {
        alert('Enter a valid Ethereum wallet address')
        return
      }

      const { chainId } = await provider.getNetwork()

      // check current network
      if (chainId !== CHAINS.ethereum_int && chainId !== CHAINS.ethereum) {
        console.log('chainId', chainId)
        alert("Switch to ethereum mainnet and reload the page")
        return
      }

      setLoading(true)

      let _mintPrice = await contract.functions.getMintPrice()
      let newPrice = (1 * convertToETH(_mintPrice.toString())).toFixed(2)
      let newGasLimit = GAS_LIMIT

      const tx = await contract.mint(1, {
        value: ethers.utils.parseEther(newPrice.toString()),
        gasLimit: newGasLimit
      })

      await tx.wait()
      setLoading(false)
      alert("NFT Airdropped!")
    } catch (e) {
      setLoading(false)
    }
  };

  return (
    <div className="App">
      <main>
        <div className="content">
          <h1>NFT AIRDROPPER</h1>
          {loading ? <div><p>Loading...</p></div> : null}
          {
            !connected ? (
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
            )
          }
        </div>
      </main>
    </div>
  );
}

export default App;
