export type AaveV2Actions = 'AaveBorrow' | 'AaveDeposit' | 'AaveWithdraw' | `AavePayback`

export type AaveV3Actions =
  | `AaveV3Borrow`
  | `AaveV3Deposit`
  | `AaveV3Withdraw`
  | `AaveV3WithdrawAuto`
  | `AaveV3Payback`
  | `AaveV3SetEMode`

export type CommonActions =
  | 'SwapAction'
  | 'PullToken'
  | 'SendToken'
  | 'SendTokenAuto'
  | 'SetApproval'
  | 'WrapEth'
  | 'UnwrapEth'
  | 'TakeFlashloan'
  | 'TakeFlashloanBalancer'
  | 'ReturnFunds'
  | 'CollectFee'
  | 'PositionCreated'

export type AjnaActions = 'AjnaDepositBorrow' | 'AjnaRepayWithdraw'

export type SparkActions =
  | `SparkBorrow`
  | `SparkDeposit`
  | `SparkWithdraw`
  | `SparkWithdrawAuto`
  | `SparkPayback`
  | `SparkSetEMode`

export type MorphoBlueActions =
  | `MorphoBlueBorrow`
  | `MorphoBlueDeposit`
  | `MorphoBlueWithdraw`
  | `MorphoBluePayback`
  | `MorphoBlueWithdrawAuto`

export type Actions = CommonActions | AaveV3Actions | AjnaActions

import { SystemConfigEntry } from './config-entries'

export type OptionalSparkContracts = Partial<Record<SparkActions, SystemConfigEntry>>
export type OptionalAaveV2Contracts = Partial<Record<AaveV2Actions, SystemConfigEntry>>
export type OptionalMorphoBlueContracts = Partial<Record<MorphoBlueActions, SystemConfigEntry>>
export type ActionContracts = Record<Actions, SystemConfigEntry>
