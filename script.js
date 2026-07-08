const CONTRACT_ADDRESS = "0x32487931C92Ce46C8280e81B723c8CDDD414Fa60";
const PAIR_ADDRESS = "0x727adc4fb4908cada01bfdf343c8934f738bb069";

const BSCSCAN_API_KEY = "MET_TA_NOUVELLE_CLE_ICI";

const ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)"
];

const PAIR_ABI = [
    "function token0() view returns(address)",
    "function token1() view returns(address)",
    "function getReserves() view returns(uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
];


let provider;
let signer;
let contract;


// Provider BSC public
const bscProvider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org/"
);


// =============================
// INFORMATIONS DU TOKEN
// =============================

async function loadTokenInfo() {

    try {

        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            bscProvider
        );


        const name = await contract.name();
        const symbol = await contract.symbol();
        const supply = await contract.totalSupply();
        const decimals = await contract.decimals();


        document.getElementById("tokenName").textContent = name;

        document.getElementById("tokenSymbol").textContent = symbol;

        document.getElementById("totalSupply").textContent =
            Number(
                ethers.utils.formatUnits(supply, decimals)
            ).toLocaleString();


    } catch(error){

        console.error(error);

    }
}


loadTokenInfo();


// =============================
// CONNEXION METAMASK
// =============================

document.getElementById("connectWallet").onclick = async () => {


    if(!window.ethereum){

        alert("Veuillez installer MetaMask.");

        return;
    }


    await window.ethereum.request({
        method:"eth_requestAccounts"
    });


    provider = new ethers.providers.Web3Provider(
        window.ethereum
    );


    signer = provider.getSigner();


    const address = await signer.getAddress();


    document.getElementById("walletAddress").textContent =
        address;


    const walletContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        provider
    );


    const decimals = await walletContract.decimals();

    const balance = await walletContract.balanceOf(address);



    document.getElementById("balance").textContent =
        ethers.utils.formatUnits(
            balance,
            decimals
        );

};



// =============================
// PRIX DXP + MARKET CAP + LIQUIDITE
// =============================


async function updateTokenPrice(){


try{


    const pair = new ethers.Contract(
        PAIR_ADDRESS,
        PAIR_ABI,
        bscProvider
    );


    const token0 = await pair.token0();

    const token1 = await pair.token1();


    const reserves = await pair.getReserves();



    let dxpReserve;
    let wbnbReserve;



    if(
        token0.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
    ){

        dxpReserve =
            Number(
                ethers.utils.formatUnits(
                    reserves.reserve0,
                    18
                )
            );


        wbnbReserve =
            Number(
                ethers.utils.formatUnits(
                    reserves.reserve1,
                    18
                )
            );


    } else {


        dxpReserve =
            Number(
                ethers.utils.formatUnits(
                    reserves.reserve1,
                    18
                )
            );


        wbnbReserve =
            Number(
                ethers.utils.formatUnits(
                    reserves.reserve0,
                    18
                )
            );

    }



    if(dxpReserve === 0){

        throw new Error("Réserves invalides");

    }



    const bnbResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
    );


    const bnbData = await bnbResponse.json();


    const bnbPrice =
        bnbData.binancecoin.usd;



    const dxpPrice =
        (wbnbReserve / dxpReserve)
        * bnbPrice;



    const supply =
        await contract.totalSupply();


    const decimals =
        await contract.decimals();



    const totalSupply =
        Number(
            ethers.utils.formatUnits(
                supply,
                decimals
            )
        );



    const marketCap =
        dxpPrice * totalSupply;



    const liquidity =
        wbnbReserve * bnbPrice * 2;



    document.getElementById("tokenPrice").innerText =
        "$" + dxpPrice.toFixed(8);



    document.getElementById("marketCap").innerText =
        "$" +
        marketCap.toLocaleString(
            undefined,
            {
                maximumFractionDigits:2
            }
        );



    document.getElementById("liquidity").innerText =
        "$" +
        liquidity.toLocaleString(
            undefined,
            {
                maximumFractionDigits:2
            }
        );



}catch(error){


    console.error(error);


    document.getElementById("tokenPrice").innerText =
        "Indisponible";


}

}



updateTokenPrice();

setInterval(
    updateTokenPrice,
    30000
);



// =============================
// ACHETER DXP
// =============================


document.getElementById("buyDXP").onclick = () => {


window.open(

"https://pancakeswap.finance/swap?outputCurrency=0x32487931C92Ce46C8280e81B723c8CDDD414Fa60",

"_blank"

);


};



// =============================
// VOIR CONTRAT BSCSCAN
// =============================


document.getElementById("viewContract").onclick = () => {


window.open(

"https://bscscan.com/token/0x32487931C92Ce46C8280e81B723c8CDDD414Fa60",

"_blank"

);


};



// =============================
// AJOUTER TOKEN METAMASK
// =============================


document.getElementById("addToken").onclick = async()=>{


if(!window.ethereum){

alert("Veuillez installer MetaMask.");

return;

}



try{


await window.ethereum.request({

method:"wallet_watchAsset",

params:{

type:"ERC20",

options:{

address:CONTRACT_ADDRESS,

symbol:"DXP",

decimals:18

}

}

});


}catch(error){

console.error(error);

}


};



// =============================
// COPIER CONTRAT
// =============================


document.getElementById("copyContract").onclick = async()=>{


try{


await navigator.clipboard.writeText(
    CONTRACT_ADDRESS
);


alert("Adresse du contrat copiée !");


}catch(error){


console.error(error);


alert(CONTRACT_ADDRESS);


}


};



// =============================
// HOLDERS
// =============================


async function updateHolders(){


try{


const response = await fetch(

`https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${CONTRACT_ADDRESS}&apikey=${BSCSCAN_API_KEY}`

);



const data = await response.json();



if(data.status === "1"){


document.getElementById("holders").innerText =

Number(data.result).toLocaleString();


}else{


document.getElementById("holders").innerText =
"N/A";


}



}catch(error){


console.error(error);


document.getElementById("holders").innerText =
"N/A";


}


}



updateHolders();


setInterval(

updateHolders,

300000

);
