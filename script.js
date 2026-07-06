const CONTRACT_ADDRESS = "0x32487931C92Ce46C8280e81B723c8CDDD414Fa60";

const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

let provider;
let signer;
let contract;

async function loadTokenInfo() {
  provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const name = await contract.name();
  const symbol = await contract.symbol();
  const supply = await contract.totalSupply();
  const decimals = await contract.decimals();

  document.getElementById("tokenName").textContent = name;
  document.getElementById("tokenSymbol").textContent = symbol;
  document.getElementById("totalSupply").textContent =
    ethers.utils.formatUnits(supply, decimals);
}

loadTokenInfo();

document.getElementById("connectWallet").onclick = async () => {
  if (!window.ethereum) {
    alert("Veuillez installer MetaMask.");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  const address = await signer.getAddress();

  document.getElementById("walletAddress").textContent = address;

  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(address);

  document.getElementById("balance").textContent =
    ethers.utils.formatUnits(balance, decimals);
};
async function updateTokenPrice() {
    try {
        const response = await fetch(
            https://api.dexscreener.com/latest/dex/tokens/0x32487931C92Ce46C8280e81B723c8CDDD414Fa60

        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
            document.getElementById("tokenPrice").innerText =
                "$" + Number(data.pairs[0].priceUsd).toFixed(8);
        } else {
            document.getElementById("tokenPrice").innerText = "En attente de cotation";
        }
    } catch (e) {
        document.getElementById("tokenPrice").innerText = "Indisponible";
    }
}

updateTokenPrice();
setInterval(updateTokenPrice, 30000);
