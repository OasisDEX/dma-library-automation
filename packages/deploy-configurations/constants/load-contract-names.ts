import { Network } from '@deploy-configurations/types/network'

export function loadContractNames(network: Network) {
  return SERVICE_REGISTRY_NAMES
}

/**
 * After issus with NodeJS require caching imports and also
 * not resolving update contract name configs we've decided to
 * abandon network specific ServiceRegistryNames and just use
 * one config without a require() statement to load the config.
 *
 * Solving problematic builds
 */
export const SERVICE_REGISTRY_NAMES = {
  common: {
    USDC_E: 'USDC.E',
    PULL_TOKEN: 'PullToken_7',
    SEND_TOKEN: 'SendToken_7',
    SEND_TOKEN_AUTO: 'SendTokenAuto_7',
    SET_APPROVAL: 'SetApproval_6',
    TAKE_A_FLASHLOAN: 'TakeFlashloan_6',
    TAKE_A_FLASHLOAN_BALANCER: 'TakeFlashloanBalancer_3',
    SWAP_ACTION: 'SwapAction_8',
    WRAP_ETH: 'WrapEth_6',
    UNWRAP_ETH: 'UnwrapEth_6',
    RETURN_FUNDS: 'ReturnFunds_6',
    COLLECT_FEE: 'CollectFee_auto',
    POSITION_CREATED: 'PositionCreated',
    ERC4626_DEPOSIT: 'ERC4626Deposit',
    ERC4626_WITHDRAW: 'ERC4626Withdraw',
    ACCOUNT_GUARD: 'AccountGuard',
    ACCOUNT_FACTORY: 'AccountFactory',
    OPERATION_EXECUTOR: 'OperationExecutor_5',
    OPERATION_STORAGE: 'OperationStorage_5',
    OPERATIONS_REGISTRY: 'OperationsRegistry_5',
    CHAINLOG_VIEWER: 'ChainLogView',
    ONE_INCH_AGGREGATOR: 'OneInchAggregator',
    ONE_INCH_AGGREGATOR5: 'OneInchAggregator5',
    DS_GUARD_FACTORY: 'DSGuardFactory',
    DS_PROXY_REGISTRY: 'DSProxyRegistry',
    DS_PROXY_FACTORY: 'DSProxyFactory',
    SWAP: 'Swap_2',
    EXCHANGE: 'Exchange',
    UNISWAP_ROUTER: 'UniswapRouter',
    BALANCER_VAULT: 'BalancerVault',
    SERVICE_REGISTRY: 'ServiceRegistry',
    WETH: 'WETH',
    DAI: 'DAI',
    USDC: 'USDC',
    STETH: 'STETH',
    WSTETH: 'WSTETH',
    WBTC: 'WBTC',
    TOKEN_BALANCE: 'TokenBalance',
    RETURN_MULTIPLE_TOKENS: 'ReturnMultipleTokens',
    PULL_TOKEN_MAX_AMOUNT: 'PullTokenMaxAmount',
  },
  aave: {
    v2: {
      DEPOSIT: 'AaveDeposit_3',
      WITHDRAW: 'AaveWithdraw_3',
      BORROW: 'AaveBorrow_3',
      PAYBACK: 'AavePayback_3',
      LENDING_POOL: 'AaveLendingPool',
      WETH_GATEWAY: 'AaveWethGateway',
    },
    v3: {
      DEPOSIT: 'AaveV3Deposit_5',
      WITHDRAW: 'AaveV3Withdraw_5',
      WITHDRAW_AUTO: 'AaveV3WithdrawAuto_5',
      BORROW: 'AaveV3Borrow_5',
      PAYBACK: 'AaveV3Payback_5',
      AAVE_POOL: 'AavePool',
      SET_EMODE: 'AaveV3SetEMode_5',
    },
    L2_ENCODER: 'AaveL2Encoder',
  },
  spark: {
    DEPOSIT: 'SparkDeposit_auto_3',
    WITHDRAW: 'SparkWithdraw_auto_3',
    WITHDRAW_AUTO: 'SparkWithdrawAuto_auto_3',
    BORROW: 'SparkBorrow_auto_3',
    PAYBACK: 'SparkPayback_auto_3',
    LENDING_POOL: 'SparkLendingPool',
    SET_EMODE: 'SparkSetEMode_auto_3',
  },
  maker: {
    DEPOSIT: 'MakerDeposit',
    PAYBACK: 'MakerPayback',
    WITHDRAW: 'MakerWithdraw',
    GENERATE: 'MakerGenerate',
    OPEN_VAULT: 'MakerOpenVault',

    MCD_VIEW: 'McdView',
    FLASH_MINT_MODULE: 'McdFlashMintModule',
    MCD_MANAGER: 'McdManager',
    MCD_JUG: 'McdJug',
    MCD_JOIN_DAI: 'McdJoinDai',
    CDP_ALLOW: 'CdpAllow',
    CHAINLOG_VIEW: 'ChainLogView',
  },
  ajna: {
    DEPOSIT_BORROW: 'AjnaDepositBorrow',
    REPAY_WITHDRAW: 'AjnaRepayWithdraw',
    ERC20_POOL_FACTORY: 'ERC20PoolFactory',
    AJNA_POOL_UTILS_INFO: 'AjnaPoolUtilsInfo',
  },
  morphoblue: {
    MORPHO_BLUE: 'MorphoBlue',
    DEPOSIT: 'MorphoBlueDeposit_auto',
    WITHDRAW: 'MorphoBlueWithdraw_auto',
    WITHDRAW_AUTO: 'MorphoBlueWithdrawAuto_auto',
    BORROW: 'MorphoBlueBorrow_auto',
    PAYBACK: 'MorphoBluePayback_auto',
  },
  test: {
    DUMMY_ACTION: 'DummyAction',
    DUMMY_OPTIONAL_ACTION: 'DummyOptionalAction',
    DUMMY_SWAP: 'DummySwap',
    DUMMY_EXCHANGE: 'DummyExchange',
    SWAP: 'uSwap',
  },
} as const

export type AllValues<T> = { [K in keyof T]: T[K] extends object ? AllValues<T[K]> : T[K] }[keyof T]

export type ContractNames = AllValues<typeof SERVICE_REGISTRY_NAMES>