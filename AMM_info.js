var { blob, seq, struct, u8 } = require('buffer-layout');
var { publicKeyLayout, accountFlagsLayout, u128, u64 } = require('./layout');
const { publicKey } = require('@project-serum/borsh')

exports.TokenSwapLayout = struct([
  u8('version'),
  u8('isInitialized'),
  u8('bumpSeed'),
  publicKey('tokenProgramId'),
  publicKey('tokenAccountA'),
  publicKey('tokenAccountB'),
  publicKey('tokenPool'),
  publicKey('mintA'),
  publicKey('mintB'),
  publicKey('feeAccount'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('ownerTradeFeeNumerator'),
  u64('ownerTradeFeeDenominator'),
  u64('ownerWithdrawFeeNumerator'),
  u64('ownerWithdrawFeeDenominator'),
  u64('hostFeeNumerator'),
  u64('hostFeeDenominator'),
  u8('curveType'),
  // Bufferblob(32, 'curveParameters'),
]);

exports.AMM_INFO_LAYOUT_V4 = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('systemDecimalsValue'),
  // Fees
  u64('minSeparateNumerator'),
  u64('minSeparateDenominator'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('pnlNumerator'),
  u64('pnlDenominator'),
  u64('swapFeeNumerator'),
  u64('swapFeeDenominator'),
  // OutPutData
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlPc'),
  u64('totalPnlCoin'),
  u128('poolTotalDepositPc'),
  u128('poolTotalDepositCoin'),
  u128('swapCoinInAmount'),
  u128('swapPcOutAmount'),
  u64('swapCoin2PcFee'),
  u128('swapPcInAmount'),
  u128('swapCoinOutAmount'),
  u64('swapPc2CoinFee'),

  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammOwner'),
  publicKey('pnlOwner')
])

exports.MARKET_STATE_LAYOUT_V3 = struct([
    blob(5),
  
    accountFlagsLayout('accountFlags'),
  
    publicKeyLayout('ownAddress'),
  
    u64('vaultSignerNonce'),
  
    publicKeyLayout('baseMint'),
    publicKeyLayout('quoteMint'),
  
    publicKeyLayout('baseVault'),
    u64('baseDepositsTotal'),
    u64('baseFeesAccrued'),
  
    publicKeyLayout('quoteVault'),
    u64('quoteDepositsTotal'),
    u64('quoteFeesAccrued'),
  
    u64('quoteDustThreshold'),
  
    publicKeyLayout('requestQueue'),
    publicKeyLayout('eventQueue'),
  
    publicKeyLayout('bids'),
    publicKeyLayout('asks'),
  
    u64('baseLotSize'),
    u64('quoteLotSize'),
  
    u64('feeRateBps'),
  
    u64('referrerRebatesAccrued'),
  
    publicKeyLayout('authority'),
    publicKeyLayout('pruneAuthority'),
  
    blob(1024),
  
    blob(7),
  ]);