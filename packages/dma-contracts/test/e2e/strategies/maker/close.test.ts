import { executeThroughProxy } from '@dma-common/utils/execute'
import { testBlockNumber } from '@dma-contracts/test/config'
import { initialiseConfig } from '@dma-contracts/test/fixtures'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import CDPManagerABI from '@oasisdex/abis/external/protocols/maker/dss-cdp-manager.json'
import ERC20ABI from '@oasisdex/abis/external/tokens/IERC20.json'
import { ADDRESSES } from '@oasisdex/addresses'
import { OPERATION_NAMES } from '@oasisdex/dma-common/constants'
import {
  DeployedSystemInfo,
  expect,
  GasEstimateHelper,
  gasEstimateHelper,
  restoreSnapshot,
} from '@oasisdex/dma-common/test-utils'
import { RuntimeConfig } from '@oasisdex/dma-common/types/common'
import { amountToWei, ensureWeiFormat } from '@oasisdex/dma-common/utils/common'
import { getLastVault, getVaultInfo } from '@oasisdex/dma-common/utils/maker'
import { CONTRACT_NAMES } from '@oasisdex/dma-deployments/constants'
import { Network } from '@oasisdex/dma-deployments/types/network'
import { ServiceRegistry } from '@oasisdex/dma-deployments/utils/wrappers'
import { ActionFactory, calldataTypes } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { loadFixture } from 'ethereum-waffle'
import { ethers, Signer } from 'ethers'

const createAction = ActionFactory.create

let DAI: Contract
let WETH: Contract

/**
 * Skipped until Maker operations more relevant.
 * Also fails due to issue with getOracleProvider and hardhat version.
 * Requires hardhat v2.9.5 or greater
 * Currently only hardhat v2.8.0 is tested as working well with tenderly export
 * */
describe.skip(`Operations | Maker | Close Position | E2E`, async () => {
  const marketPrice = new BigNumber(1582)

  let provider: JsonRpcProvider
  let signer: Signer
  let address: string
  let system: DeployedSystemInfo
  let registry: ServiceRegistry
  let config: RuntimeConfig

  beforeEach(async () => {
    ;({ config, provider, signer, address } = await loadFixture(initialiseConfig))

    DAI = new ethers.Contract(ADDRESSES[Network.MAINNET].common.DAI, ERC20ABI, provider).connect(
      signer,
    )
    WETH = new ethers.Contract(ADDRESSES[Network.MAINNET].common.WETH, ERC20ABI, provider).connect(
      signer,
    )

    const { snapshot } = await restoreSnapshot({
      config,
      provider,
      blockNumber: testBlockNumber,
      useFallbackSwap: true,
    })

    system = snapshot.deployed.system
    registry = snapshot.deployed.registry

    await system.common.exchange.setPrice(
      ADDRESSES[Network.MAINNET].common.ETH,
      amountToWei(marketPrice).toFixed(0),
    )
  })

  let gasEstimates: GasEstimateHelper

  it(`should open vault, deposit ETH, generate DAI, repay debt in full and withdraw collateral`, async () => {
    // Test set up values
    const initialColl = new BigNumber(100)
    const initialDebt = new BigNumber(20000)

    gasEstimates = gasEstimateHelper()

    await WETH.approve(system.common.userProxyAddress, amountToWei(initialColl).toFixed(0))

    const openVaultAction = createAction(
      await registry.getEntryHash(CONTRACT_NAMES.maker.OPEN_VAULT),
      [calldataTypes.maker.Open, calldataTypes.paramsMap],
      [
        {
          joinAddress: ADDRESSES[Network.MAINNET].maker.JoinETH_A,
        },
        [0],
      ],
    )

    const pullCollateralIntoProxyAction = createAction(
      await registry.getEntryHash(CONTRACT_NAMES.common.PULL_TOKEN),
      [calldataTypes.common.PullToken, calldataTypes.paramsMap],
      [
        {
          from: config.address,
          asset: ADDRESSES[Network.MAINNET].common.WETH,
          amount: new BigNumber(ensureWeiFormat(initialColl)).toFixed(0),
        },
        [0],
      ],
    )

    const depositAction = createAction(
      await registry.getEntryHash(CONTRACT_NAMES.maker.DEPOSIT),
      [calldataTypes.maker.Deposit, calldataTypes.paramsMap],
      [
        {
          joinAddress: ADDRESSES[Network.MAINNET].maker.JoinETH_A,
          vaultId: 0,
          amount: ensureWeiFormat(initialColl),
        },
        [0, 1, 0],
      ],
    )

    const generateAction = createAction(
      await registry.getEntryHash(CONTRACT_NAMES.maker.GENERATE),
      [calldataTypes.maker.Generate, calldataTypes.paramsMap],
      [
        {
          to: address,
          vaultId: 0,
          amount: ensureWeiFormat(initialDebt),
        },
        [0, 1, 0],
      ],
    )

    const paybackDai = new BigNumber(0) // Can be anything because paybackAll flag is true
    const paybackAll = true
    const paybackAction = createAction(
      await registry.getEntryHash(CONTRACT_NAMES.maker.PAYBACK),
      [calldataTypes.maker.Payback, calldataTypes.paramsMap],
      [
        {
          vaultId: 0,
          userAddress: address,
          daiJoin: ADDRESSES[Network.MAINNET].maker.JoinDAI,
          amount: ensureWeiFormat(paybackDai),
          paybackAll: paybackAll,
        },
        [1, 0, 0, 0, 0],
      ],
    )

    const ALLOWANCE = new BigNumber('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
    await DAI.approve(system.common.userProxyAddress, ensureWeiFormat(ALLOWANCE))

    const withdrawAction = createAction(
      await registry.getEntryHash(CONTRACT_NAMES.maker.WITHDRAW),
      [calldataTypes.maker.Withdraw, calldataTypes.paramsMap],
      [
        {
          vaultId: 0,
          userAddress: address,
          joinAddr: ADDRESSES[Network.MAINNET].maker.JoinETH_A,
          amount: ensureWeiFormat(initialColl),
        },
        [1, 0, 0, 0],
      ],
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, txReceipt] = await executeThroughProxy(
      system.common.userProxyAddress,
      {
        address: system.common.operationExecutor.address,
        calldata: system.common.operationExecutor.interface.encodeFunctionData('executeOp', [
          [
            openVaultAction,
            pullCollateralIntoProxyAction,
            depositAction,
            generateAction,
            paybackAction,
            withdrawAction,
          ],
          OPERATION_NAMES.maker.OPEN_DRAW_AND_CLOSE,
        ]),
      },
      signer,
    )

    gasEstimates.save(txReceipt)

    const vault = await getLastVault(provider, signer, system.common.userProxyAddress)
    const info = await getVaultInfo(system.maker.mcdView, vault.id, vault.ilk)

    const expectedColl = new BigNumber(0)
    const expectedDebt = new BigNumber(0)

    const precision = 18 - 1 // To account for precision loss in Maker Vat
    expect(info.coll.toFixed(precision)).to.equal(expectedColl.toFixed(precision))
    expect(info.debt.toFixed(precision)).to.equal(expectedDebt.toFixed(precision))

    const cdpManagerContract = new ethers.Contract(
      ADDRESSES[Network.MAINNET].maker.CdpManager,
      CDPManagerABI,
      provider,
    ).connect(signer)
    const vaultOwner = await cdpManagerContract.owns(vault.id)
    expect.toBeEqual(vaultOwner, system.common.userProxyAddress)
  })

  after(() => {
    gasEstimates.print()
  })
})