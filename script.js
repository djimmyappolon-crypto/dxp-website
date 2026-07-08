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
  const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org/"
);
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
        const provider = new ethers.providers.JsonRpcProvider(
            "https://bsc-dataseed.binance.org/"
        );

        const PAIR_ADDRESS = "0x727adc4fb4908cada01bfdf343c8934f738bb069";

        const PAIR_ABI = [
            "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
        ];

        const pair = new ethers.Contract(PAIR_ADDRESS, PAIR_ABI, provider);

        const reserves = await pair.getReserves();

        // token0 = DXP (18 décimales)
        const dxpReserve = Number(ethers.utils.formatUnits(reserves.reserve0, 18));

        // token1 = WBNB (18 décimales)
        const wbnbReserve = Number(ethers.utils.formatUnits(reserves.reserve1, 18));

        // Prix actuel du BNB en USD
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
        );

        const data = await response.json();

        const bnbPrice = data.binancecoin.usd;

        const dxpPrice = (wbnbReserve / dxpReserve) * bnbPrice;
// Market Cap
const totalSupply = 100000000;
const marketCap = dxpPrice * totalSupply;

// Liquidité (2 côtés de la paire)
const liquidity = wbnbReserve * bnbPrice * 2;

document.getElementById("marketCap").innerText =
    "$" + marketCap.toLocaleString(undefined, {
        maximumFractionDigits: 2
    });

document.getElementById("liquidity").innerText =
    "$" + liquidity.toLocaleString(undefined, {
        maximumFractionDigits: 2
    });
        document.getElementById("tokenPrice").innerText =
            "$" + dxpPrice.toFixed(8);

    } catch (err) {
        console.error(err);
        document.getElementById("tokenPrice").innerText = "Indisponible";
    }
}

updateTokenPrice();
setInterval(updateTokenPrice, 30000);
// Acheter DXP sur PancakeSwap
document.getElementById("buyDXP").onclick = () => {
    window.open(
        "https://pancakeswap.finance/swap?outputCurrency=0x32487931C92Ce46C8280e81B723c8CDDD414Fa60",
        "_blank"
    );
};

// Voir le contrat sur BscScan
document.getElementById("viewContract").onclick = () => {
    window.open(
        "https://bscscan.com/token/0x32487931C92Ce46C8280e81B723c8CDDD414Fa60",
        "_blank"
    );
};

// Ajouter DXP à MetaMask
document.getElementById("addToken").onclick = async () => {

    if (!window.ethereum) {
        alert("Veuillez installer MetaMask.");
        return;
    }

    try {

        await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20",
                options: {
                    address: "0x32487931C92Ce46C8280e81B723c8CDDD414Fa60",
                    symbol: "DXP",
                    decimals: 18
                }
            }
        });

    } catch (err) {
        console.error(err);
    }
};
document.getElementById("copyContract").onclick = async () => {
    try {
        await navigator.clipboard.writeText(CONTRACT_ADDRESS);
        alert("Adresse du contrat copiée !");
    } catch (err) {
        console.error(err);
        alert(CONTRACT_ADDRESS);
    }
};
// Nombre de holders (via BscScan API)
async function updateHolders() {
    try {
        // Remplace TA_CLE_API_BSCSCAN par ta clé API BscScan
        const apiKey = "HWX6BZVRQWVED8PE8UBR4YX369U3EEHQE5";

        const response = await fetch(
            `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${CONTRACT_ADDRESS}&apikey=${apiKey}`
        );

        const data = await response.json();

        if (data.status === "1") {
            document.getElementById("holders").innerText =
                Number(data.result).toLocaleString();
        } else {
            document.getElementById("holders").innerText = "N/A";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("holders").innerText = "N/A";
    }
}

updateHolders();
setInterval(updateHolders, 300000); // Mise à jour toutes les 5 minutes
