import { Protocol } from '@deploy-configurations/types/protocol'

export const OPERATION_NAMES = {
  aave: {
    v2: {
      OPEN_POSITION: 'OpenAAVEPosition',
      CLOSE_POSITION: 'CloseAAVEPosition_3',
      INCREASE_POSITION: 'IncreaseAAVEPosition',
      DECREASE_POSITION: 'DecreaseAAVEPosition',
      DEPOSIT_BORROW: 'AAVEDepositBorrow',
      OPEN_DEPOSIT_BORROW: 'AAVEOpenDepositBorrow',
      DEPOSIT: 'AAVEDeposit',
      BORROW: 'AAVEBorrow',
      PAYBACK_WITHDRAW: 'AAVEPaybackWithdraw_2',
    },
    v3: {
      OPEN_POSITION: 'OpenAAVEV3Position',
      CLOSE_AND_EXIT: 'CloseAAVEV3Position_4',
      CLOSE_AND_REMAIN: 'CloseAndRemainAAVEV3Position',
      ADJUST_RISK_UP: 'AdjustRiskUpAAVEV3Position_5',
      ADJUST_RISK_DOWN: 'AdjustRiskDownAAVEV3Position_6',
      DEPOSIT_BORROW: 'AAVEV3DepositBorrow',
      OPEN_DEPOSIT_BORROW: 'AAVEV3OpenDepositBorrow',
      DEPOSIT: 'AAVEV3Deposit',
      BORROW: 'AAVEV3Borrow',
      PAYBACK_WITHDRAW: 'AAVEV3PaybackWithdraw',
      WITHDRAW: 'AAVEV3Withdraw_auto',
      WITHDRAW_TO_DEBT: 'AAVEV3WithdrawToDebt_auto',
    },
  },
  spark: {
    OPEN_POSITION: 'SparkOpenPosition',
    CLOSE_AND_EXIT: 'SparkClosePosition_4',
    CLOSE_AND_REMAIN: 'CloseAndRemainSparkPosition_4',
    ADJUST_RISK_UP: 'SparkAdjustRiskUp_Auto_4',
    ADJUST_RISK_DOWN: 'SparkAdjustRiskDown_Auto_4',
    DEPOSIT_BORROW: 'SparkDepositBorrow',
    OPEN_DEPOSIT_BORROW: 'SparkOpenDepositBorrow',
    DEPOSIT: 'SparkDeposit',
    BORROW: 'SparkBorrow',
    PAYBACK_WITHDRAW: 'SparkPaybackWithdraw',
    WITHDRAW: 'SparkWithdraw_auto',
    WITHDRAW_TO_DEBT: 'SparkWithdrawToDebt_auto',
  },
  maker: {
    OPEN_AND_DRAW: 'OpenAndDraw',
    OPEN_DRAW_AND_CLOSE: 'OpenDrawAndClose',
    INCREASE_MULTIPLE: 'IncreaseMultiple',
    INCREASE_MULTIPLE_WITH_DAI_TOP_UP: 'IncreaseMultipleWithDaiTopup',
    INCREASE_MULTIPLE_WITH_COLL_TOP_UP: 'IncreaseMultipleWithCollateralTopup',
    INCREASE_MULTIPLE_WITH_DAI_AND_COLL_TOP_UP: 'IncreaseMultipleWithDaiAndCollTopup',
    INCREASE_MULTIPLE_WITH_FLASHLOAN: 'IncreaseMultipleWithFlashloan',
    INCREASE_MULTIPLE_WITH_FLASHLOAN_AND_DAI_AND_COLL_TOP_UP:
      'IncreaseMultipleWithFlashloanWithDaiAndCollTopup',
  },
  ajna: {
    OPEN_MULTIPLY_POSITION: 'AjnaOpenMultiplyPosition',
    ADJUST_RISK_UP: 'AjnaAdjustRiskUp',
    ADJUST_RISK_DOWN: 'AjnaAdjustRiskDown',
    DEPOSIT_BORROW: 'AjnaDepositBorrow',
    PAYBACK_WITHDRAW: 'AjnaPaybackWithdraw',
    CLOSE_POSITION_TO_QUOTE: 'AjnaCloseToQuotePosition',
    CLOSE_POSITION_TO_COLLATERAL: 'AjnaCloseToCollateralPosition',
  },
  morphoblue: {
    OPEN_POSITION: 'MorphoBlueOpenPosition',
    CLOSE_POSITION: 'MorphoBlueCloseAndExit_auto_3',
    CLOSE_AND_REMAIN: 'MorphoBlueCloseAndRemain_auto',
    ADJUST_RISK_UP: 'MorphoBlueAdjustRiskUp_2',
    ADJUST_RISK_DOWN: 'MorphoBlueAdjustRiskDown',
    DEPOSIT_BORROW: 'MorphoBlueDepositBorrow',
    OPEN_DEPOSIT_BORROW: 'MorphoBlueOpenDepositBorrow',
    DEPOSIT: 'MorphoBlueDeposit',
    BORROW: 'MorphoBlueBorrow',
    PAYBACK_WITHDRAW: 'MorphoBluePaybackWithdraw',
    // Used with Partial Take Profit
    WITHDRAW: 'MorphoBlueWithdraw_auto_2',
    WITHDRAW_TO_DEBT: 'MorphoBlueWithdrawToDebt_auto_2',
  },
  common: {
    CUSTOM_OPERATION: 'CustomOperation',
    ERC4626_DEPOSIT: 'ERC4626Deposit',
    ERC4626_WITHDRAW: 'ERC4626Withdraw',
  },
} as const

type ValuesOf<T> = T[keyof T]
type AaveV2OperationsNames = ValuesOf<(typeof OPERATION_NAMES)['aave']['v2']>
type AaveV3OperationsNames = ValuesOf<(typeof OPERATION_NAMES)['aave']['v3']>
type MakerOperationsNames = ValuesOf<(typeof OPERATION_NAMES)['maker']>
type AjnaOperationsNames = ValuesOf<(typeof OPERATION_NAMES)['ajna']>
type SparkOperationsNames = ValuesOf<(typeof OPERATION_NAMES)['spark']>
type MorphoBlueOperationsNames = ValuesOf<(typeof OPERATION_NAMES)['morphoblue']>
type CommonOperationsNames = ValuesOf<(typeof OPERATION_NAMES)['common']>

/**
 * Refinance operations names
 *
 * @dev This type is used to generate the names of the refinance operations. It uses template
 * literal types from Typescript 4.1 to generate the names
 *
 * @dev The `Protocol` type from `@dma-library` is redefined here to avoid dependencies issues.
 * The type should actually be moved here and
 */
export type RefinanceOperationsNames = `Refinance-${Protocol}-${Protocol}`

export type OperationNames =
  | CommonOperationsNames
  | AaveV2OperationsNames
  | AaveV3OperationsNames
  | MakerOperationsNames
  | AjnaOperationsNames
  | SparkOperationsNames
  | MorphoBlueOperationsNames
  | RefinanceOperationsNames
