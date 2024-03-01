import { AaveV3WithdrawOperation, withdraw as aaveV3Withdraw } from "@dma-library/operations/aave/auto/withdraw";
import {
  AaveV3WithdrawToDebtOperation,
  withdrawToDebt as aaveV3WithdrawToDebt
} from "@dma-library/operations/aave/auto/withdraw-to-debt";
import { borrow as sparkBorrow, SparkBorrowOperation } from './borrow/borrow'
import { deposit as sparkDeposit, SparkDepositOperation } from './borrow/deposit'
import {
  depositBorrow as sparkDepositBorrow,
  SparkDepositBorrowOperation,
} from './borrow/deposit-borrow'
import {
  openDepositBorrow as sparkOpenDepositBorrow,
  SparkOpenDepositBorrowOperation,
} from './borrow/open-deposit-and-borrow'
import {
  paybackWithdraw as sparkPaybackWithdraw,
  SparkPaybackWithdrawOperation,
} from './borrow/payback-withdraw'
import {
  adjustRiskDown as sparkAdjustRiskDown,
  SparkAdjustDownOperation,
} from './multiply/adjust-risk-down'
import {
  adjustRiskUp as sparkAdjustRiskUp,
  SparkAdjustUpOperation,
} from './multiply/adjust-risk-up'
import { close as sparkClose, SparkCloseOperation } from './multiply/close'
import { open as sparkOpen, SparkOpenOperation } from './multiply/open'
// Auto
import {
  withdraw as sparkWithdraw,
  SparkWithdrawOperation,
} from './auto/withdraw'
import {
  withdrawToDebt as sparkWithdrawToDebt,
  SparkWithdrawToDebtOperation,
} from './auto/withdraw-to-debt'

const borrow = {
  borrow: sparkBorrow,
  deposit: sparkDeposit,
  depositBorrow: sparkDepositBorrow,
  openDepositBorrow: sparkOpenDepositBorrow,
  paybackWithdraw: sparkPaybackWithdraw,
  withdraw: sparkWithdraw,
  withdrawToDebt: sparkWithdrawToDebt,
}
const multiply = {
  open: sparkOpen,
  close: sparkClose,
  adjustRiskUp: sparkAdjustRiskUp,
  adjustRiskDown: sparkAdjustRiskDown,
}

export type SparkBorrowOperations = {
  borrow: SparkBorrowOperation
  deposit: SparkDepositOperation
  depositBorrow: SparkDepositBorrowOperation
  openDepositBorrow: SparkOpenDepositBorrowOperation
  paybackWithdraw: SparkPaybackWithdrawOperation
  withdraw: SparkWithdrawOperation
  withdrawToDebt: SparkWithdrawToDebtOperation
}

export type SparkMultiplyOperations = {
  open: SparkOpenOperation
  close: SparkCloseOperation
  adjustRiskUp: SparkAdjustUpOperation
  adjustRiskDown: SparkAdjustDownOperation
}

export type SparkOperations = {
  borrow: SparkBorrowOperations
  multiply: SparkMultiplyOperations
  auto: {
    withdraw: SparkWithdrawOperation
    withdrawToDebt: SparkWithdrawToDebtOperation
  }
}

export const sparkOperations: SparkOperations = {
  borrow,
  multiply,
  auto: {
    withdraw: sparkWithdraw,
    withdrawToDebt: sparkWithdrawToDebt,
  },
}
