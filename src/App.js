import { ethers } from 'ethers';
import './App.css';

function App() {
  const isAddressValid = () => {
    ethers.utils.isAddress('0x8ba1f109551bd432803012645ac136ddd64dba72'); // true
  }

  const airdrop = () => {
    console.log('is valid:', isAddressValid())
  }

  return (
    <div className="App">
      <main>
        <div className='content'>
          <h1>NFT AIRDROPPER</h1>
          <div className='input-container'>
            <input placeholder='Wallet address' />
            <button onClick={airdrop}>airdrop!</button>
          </div>
        </div>
      </main>
    </div >
  );
}

export default App;
