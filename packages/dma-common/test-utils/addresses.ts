import { ADDRESSES } from '@oasisdex/addresses'
import { Network } from '@oasisdex/dma-deployments/types/network'
import { constants } from 'ethers'

// Type guards
export function isMainnetByNetwork(network: Network): network is Network.MAINNET {
  return network === Network.MAINNET
}
export function isOptimismByNetwork(network: Network): network is Network.OPTIMISM {
  return network === Network.OPTIMISM
}

type NetworkAddressesForNetwork<T extends Network> = T extends Network.MAINNET
  ? MainnetAddresses
  : T extends Network.OPTIMISM
  ? OptMainnetAddresses
  : never
export function addressesByNetwork<T extends Network>(network: T): NetworkAddressesForNetwork<T> {
  switch (network) {
    case Network.MAINNET:
      return testAddresses[Network.MAINNET] as NetworkAddressesForNetwork<T>
    case Network.OPTIMISM:
      return testAddresses[Network.OPTIMISM] as NetworkAddressesForNetwork<T>
    default:
      throw new Error(`Network ${network} not supported`)
  }
}

// These addresses are used to map the addresses in the library
// Into a form expected by our tests
// TODO: Use addresses from our deploy system should be the source of truth for Addresses
if (!ADDRESSES[Network.MAINNET].aave.v2) throw new Error('Missing aave v2 addresses for mainnet')
const testAddresses = {
  [Network.MAINNET]: {
    DAI: ADDRESSES[Network.MAINNET].common.DAI,
    ETH: ADDRESSES[Network.MAINNET].common.ETH,
    WETH: ADDRESSES[Network.MAINNET].common.WETH,
    STETH: ADDRESSES[Network.MAINNET].common.STETH,
    WSTETH: ADDRESSES[Network.MAINNET].common.WSTETH,
    WBTC: ADDRESSES[Network.MAINNET].common.WBTC,
    USDC: ADDRESSES[Network.MAINNET].common.USDC,
    feeRecipient: ADDRESSES[Network.MAINNET].common.FeeRecipient,
    chainlinkEthUsdPriceFeed: ADDRESSES[Network.MAINNET].common.ChainlinkEthUsdPriceFeed,
    priceOracle: ADDRESSES[Network.MAINNET].aave.v2.PriceOracle,
    lendingPool: ADDRESSES[Network.MAINNET].aave.v2.LendingPool,
    protocolDataProvider: ADDRESSES[Network.MAINNET].aave.v2.ProtocolDataProvider,
    aaveOracle: ADDRESSES[Network.MAINNET].aave.v3.AaveOracle,
    pool: ADDRESSES[Network.MAINNET].aave.v3.Pool,
    poolDataProvider: ADDRESSES[Network.MAINNET].aave.v3.AaveProtocolDataProvider,
  },
  [Network.OPTIMISM]: {
    DAI: ADDRESSES[Network.OPTIMISM].common.DAI,
    ETH: ADDRESSES[Network.OPTIMISM].common.ETH,
    WETH: ADDRESSES[Network.OPTIMISM].common.WETH,
    STETH: constants.AddressZero,
    WSTETH: ADDRESSES[Network.OPTIMISM].common.WSTETH,
    WBTC: ADDRESSES[Network.OPTIMISM].common.WBTC,
    USDC: ADDRESSES[Network.OPTIMISM].common.USDC,
    feeRecipient: ADDRESSES[Network.OPTIMISM].common.FeeRecipient,
    chainlinkEthUsdPriceFeed: ADDRESSES[Network.OPTIMISM].common.ChainlinkEthUsdPriceFeed,
    aaveOracle: ADDRESSES[Network.OPTIMISM].aave.v3.AaveOracle,
    pool: ADDRESSES[Network.OPTIMISM].aave.v3.Pool,
    poolDataProvider: ADDRESSES[Network.OPTIMISM].aave.v3.AaveProtocolDataProvider,
  },
}

export type MainnetAddresses = (typeof testAddresses)[Network.MAINNET]
export type OptMainnetAddresses = (typeof testAddresses)[Network.OPTIMISM]
export type NetworkAddressesForTests = MainnetAddresses | OptMainnetAddresses