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
  const [wallet, setWallet] = useState();
  const [token, setToken] = useState({ name: '', symbol: '' })
  const [loading, setLoading] = useState(false);
  const [tokensOwned, setTokensOwned] = useState();
  const [tokensOwnedIds, setTokensOwnedIds] = useState([]);
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

      let _wallet = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      let _tokensOwned = await contract.functions.balanceOf(_wallet[0])
      // let _tokensOwned = await contract.functions.balanceOf("0x402CcA4ed7d737d901A831849106d142C98FD68f")

      setTokensOwned(Number(_tokensOwned[0]))
      setWallet(_wallet[0]);

      let a = []

      for (let i = 0; i < _tokensOwned; i++) {
        a.push(i)
      }

      setTokensOwnedIds(a)

      // setWallet("0x402CcA4ed7d737d901A831849106d142C98FD68f")
      // check if user is owner
      // if (!await isOwner(_wallet[0])) {
      //   setConnected(false)
      //   alert('You are not the contract owner!')
      //   return
      // }

      let name = await contract.functions.name()
      let symbol = await contract.functions.symbol()
      let tokenInfo = { name: name[0], symbol: symbol[0] }

      setToken(tokenInfo)
      setLoading(false)
      setConnected(true)
    } catch (e) {
      alert("Could not connect. Try again")
      console.log(e.message)
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

      // check no of tokens owned
      if (tokensOwnedIds.length < 1) {
        alert('You do not have any NFTs to airdrop!')
        return
      }

      // check if address is valid
      if (!isAddressValid()) {
        alert('Enter a valid Ethereum wallet address')
        return
      }

      // get connected wallet network chain ID
      const { chainId } = await provider.getNetwork()

      // check current network
      if (chainId !== CHAINS.ethereum_int && chainId !== CHAINS.ethereum) {
        console.log('chainId', chainId)
        alert("Switch to ethereum mainnet and reload the page")
        return
      }

      setLoading(true)

      const _tokenToAirdrop = tokensOwnedIds.length

      console.warn('airdropping #', _tokenToAirdrop)

      // let _mintPrice = await contract.functions.getMintPrice()
      // let newPrice = (1 * convertToETH(_mintPrice.toString())).toFixed(2)
      // let newGasLimit = GAS_LIMIT

      // const tx = await contract.mint(1, {
      //   value: ethers.utils.parseEther(newPrice.toString()),
      //   gasLimit: newGasLimit
      // })

      // console.log('wallet', wallet)
      // console.log('address', address)
      // console.log(await contract.functions)

      let approveTx = await contract.functions.approve(
        address,
        _tokenToAirdrop, {
        gasLimit: GAS_LIMIT
      })

      await approveTx.wait()

      let transferFromTx = await contract.functions.transferFrom(
        wallet,
        address,
        _tokenToAirdrop, {
        gasLimit: GAS_LIMIT
      })

      await transferFromTx.wait()

      // await tx.wait()
      setLoading(false)
      alert("NFT Airdropped!")
    } catch (e) {
      alert('Airdrop failed!')
      console.warn(e.message)
      setLoading(false)
    }
  };

  return (
    <div className="App">
      <main>
        <div className="content">
          <h1>NFT AIRDROPPER</h1>
          {loading
            ? <div><p>Loading...</p></div>
            : <p>{token.name} - {token.symbol} - {tokensOwned ? tokensOwned : '0'} owned</p>}
          {
            !connected
              ? (
                <div>
                  <button onClick={connectWallet}>Connect your wallet</button>
                </div>
              ) : (
                <div>
                  {
                    !loading
                      ? <div className="input-container">
                        <input
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="Wallet address"
                        />
                        <button onClick={airdrop}>airdrop!</button>
                      </div>
                      : null
                  }
                </div>
              )
          }
        </div>
      </main>
    </div>
  );
}

export default App;
