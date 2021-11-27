const { Connection, TransactionInstruction, PublicKey, Transaction, Keypair } = require('@solana/web3.js');
const { AMM_INFO_LAYOUT_V4, MARKET_STATE_LAYOUT_V3 } = require('./AMM_info');
const { Parser } = require('./Parser');

//需要修改的参数

//钱包私钥
const privateKey = JSON.parse('');
// 推荐使用第三方Node，如QuickNode
var connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// 交易对AMM ID，实际使用可自行通过监控获取
const AmmId = new PublicKey('')
const UserOwner = new PublicKey('')
// swap交易对的Token Account|对应UserOwner的TokenAccount
const inTokenAccount = new PublicKey('')
const outTokenAccount = new PublicKey('')
const buyAmount = 0.01 //USDC
const decimal = 1e6 //buy Amount Decimal
// 卖出延时 毫秒
const sellDelay = 1000 //ms

const keypair = Keypair.fromSecretKey(new Uint8Array(privateKey));
const RAYDIUM_AMM_PROGRAM = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const Amm_Authority = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1')

async function main() {
  var TokenProgram = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  var AmmId = AmmId
  var AccountInfoDecode = await getAMMInfo(AmmId)
  var AmmAuthority = Amm_Authority
  var AmmOpenOrders = AccountInfoDecode.ammOpenOrders
  var AmmTargetOrders = AccountInfoDecode.ammTargetOrders
  var PoolCoinTokenAccount = AccountInfoDecode.poolCoinTokenAccount
  var PoolPcTokenAccount = AccountInfoDecode.poolPcTokenAccount
  var SerumProgramId = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')
  var SerumMarket = AccountInfoDecode.serumMarket
  var MarketInfoDecode = await getMarketInfo(SerumMarket)
  var SerumBids = MarketInfoDecode.bids
  var SerumAsks = MarketInfoDecode.asks
  var SerumEventQueue = MarketInfoDecode.eventQueue
  var SerumCoinVaultAccount = MarketInfoDecode.baseVault
  var SerumPcVaultAccount = MarketInfoDecode.quoteVault
  var SerumVaultSigner = UserOwner
  var UserOwner = UserOwner

  var UserSourceTokenAccount = inTokenAccount
  var UserDestTokenAccount = outTokenAccount

  console.log(new Date())
  var startBuy = await Buy(TokenProgram, AmmId, AmmAuthority, AmmOpenOrders, AmmTargetOrders, PoolCoinTokenAccount, PoolPcTokenAccount, SerumProgramId, SerumMarket, SerumBids, SerumAsks, SerumEventQueue, SerumCoinVaultAccount, SerumPcVaultAccount, SerumVaultSigner, UserSourceTokenAccount, UserDestTokenAccount, UserOwner)
  if (startBuy) {
    console.log(new Date())
    var getTokenBalance = await connection.getParsedTokenAccountsByOwner(UserOwner, { mint: MarketInfoDecode.baseMint })
    var tokenBalance = getTokenBalance.value[0].account.data.parsed.info.tokenAmount.amount
    console.log('token balance:', tokenBalance)
    console.log('wait for sell delay:', sellDelay, 'ms')
    if (tokenBalance) {
      setTimeout(async function () {
        console.log(new Date())
        await Sell(tokenBalance, TokenProgram, AmmId, AmmAuthority, AmmOpenOrders, AmmTargetOrders, PoolCoinTokenAccount, PoolPcTokenAccount, SerumProgramId, SerumMarket, SerumBids, SerumAsks, SerumEventQueue, SerumCoinVaultAccount, SerumPcVaultAccount, SerumVaultSigner, UserOwner)
        console.log(new Date())
      }, sellDelay)
    }
  }
}

main()

async function getAMMInfo(AmmId) {
  var ammIdAccounts = await connection.getAccountInfo(AmmId);
  var AccountInfoDecode = AMM_INFO_LAYOUT_V4.decode(Buffer.from(ammIdAccounts.data))
  return AccountInfoDecode
}
async function getMarketInfo(SerumMarket) {
  var getMarket = await connection.getAccountInfo(SerumMarket);
  var marketDecode = MARKET_STATE_LAYOUT_V3.decode(Buffer.from(getMarket.data))
  return marketDecode
}

async function Buy(TokenProgram, AmmId, AmmAuthority, AmmOpenOrders, AmmTargetOrders, PoolCoinTokenAccount, PoolPcTokenAccount, SerumProgramId, SerumMarket, SerumBids, SerumAsks, SerumEventQueue, SerumCoinVaultAccount, SerumPcVaultAccount, SerumVaultSigner, UserSourceTokenAccount, UserDestTokenAccount, UserOwner) {
  console.log('Start Buy')
  INST_LAYOUT = new Parser()
    .u8("cmd")
    .u64("in_amount")
    .u64("min_out_amount");
  const buffer = INST_LAYOUT.encode({
    cmd: 9,
    in_amount: buyAmount * decimal,
    min_out_amount: 0
  });

  const ix = new TransactionInstruction({
    programId: RAYDIUM_AMM_PROGRAM,
    keys: [
      { pubkey: TokenProgram, isSigner: false, isWritable: false },
      { pubkey: AmmId, isSigner: false, isWritable: true },
      { pubkey: AmmAuthority, isSigner: false, isWritable: false },
      { pubkey: AmmOpenOrders, isSigner: false, isWritable: true },
      { pubkey: AmmTargetOrders, isSigner: false, isWritable: true },
      { pubkey: PoolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: PoolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: SerumProgramId, isSigner: false, isWritable: false },
      { pubkey: SerumMarket, isSigner: false, isWritable: true },
      { pubkey: SerumBids, isSigner: false, isWritable: true },
      { pubkey: SerumAsks, isSigner: false, isWritable: true },
      { pubkey: SerumEventQueue, isSigner: false, isWritable: true },
      { pubkey: SerumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: SerumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: SerumVaultSigner, isSigner: false, isWritable: false },
      { pubkey: UserSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: UserDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: UserOwner, isSigner: true, isWritable: false },
    ],
    data: buffer,
  });

  const tradeTx = new Transaction();
  tradeTx.add(ix)
  // console.log(tradeTx)
  // console.log(keypair)
  const signTransaction = await connection.sendTransaction(tradeTx, [keypair], { skipPreflight: true });
  await connection.confirmTransaction(signTransaction, 'confirmed');
  console.log('Buy Success:', signTransaction)
  return true
}

async function Sell(tokenBalance, TokenProgram, AmmId, AmmAuthority, AmmOpenOrders, AmmTargetOrders, PoolCoinTokenAccount, PoolPcTokenAccount, SerumProgramId, SerumMarket, SerumBids, SerumAsks, SerumEventQueue, SerumCoinVaultAccount, SerumPcVaultAccount, SerumVaultSigner, UserOwner) {
  console.log('Start Sell')

  var UserSourceTokenAccount = outTokenAccount
  var UserDestTokenAccount = inTokenAccount

  INST_LAYOUT = new Parser()
    .u8("cmd")
    .u64("in_amount")
    .u64("min_out_amount");
  const buffer = INST_LAYOUT.encode({
    cmd: 9,
    in_amount: tokenBalance,
    min_out_amount: 0
  });

  const ix = new TransactionInstruction({
    programId: RAYDIUM_AMM_PROGRAM,
    keys: [
      { pubkey: TokenProgram, isSigner: false, isWritable: false },
      { pubkey: AmmId, isSigner: false, isWritable: true },
      { pubkey: AmmAuthority, isSigner: false, isWritable: false },
      { pubkey: AmmOpenOrders, isSigner: false, isWritable: true },
      { pubkey: AmmTargetOrders, isSigner: false, isWritable: true },
      { pubkey: PoolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: PoolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: SerumProgramId, isSigner: false, isWritable: false },
      { pubkey: SerumMarket, isSigner: false, isWritable: true },
      { pubkey: SerumBids, isSigner: false, isWritable: true },
      { pubkey: SerumAsks, isSigner: false, isWritable: true },
      { pubkey: SerumEventQueue, isSigner: false, isWritable: true },
      { pubkey: SerumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: SerumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: SerumVaultSigner, isSigner: false, isWritable: false },
      { pubkey: UserSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: UserDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: UserOwner, isSigner: true, isWritable: false },
    ],
    data: buffer,
  });

  const tradeTx = new Transaction();
  tradeTx.add(ix)
  // console.log(tradeTx)
  // console.log(keypair)
  const signTransaction = await connection.sendTransaction(tradeTx, [keypair], { skipPreflight: true });
  await connection.confirmTransaction(signTransaction, 'confirmed');
  console.log('Sell Success:', signTransaction)
  return signTransaction
}