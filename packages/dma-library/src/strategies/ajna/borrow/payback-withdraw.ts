import ajnaProxyActionsAbi from '@abis/external/protocols/ajna/ajnaProxyActions.json'
import { prepareAjnaPayload, resolveAjnaEthAction } from '@dma-library/protocols/ajna'
import {
  AjnaBorrowPayload,
  AjnaCommonDependencies,
  AjnaPosition,
  Strategy,
} from '@dma-library/types/ajna'
import { ethers } from 'ethers'

import {
  validateDustLimit,
  validateOverWithdraw,
  validateWithdrawUndercollateralized,
} from '../validation'
import { validateWithdrawCloseToMaxLtv } from '../validation/closeToMaxLtv'

export type AjnaPaybackWithdrawStrategy = (
  args: AjnaBorrowPayload,
  dependencies: AjnaCommonDependencies,
) => Promise<Strategy<AjnaPosition>>

export const paybackWithdraw: AjnaPaybackWithdrawStrategy = async (args, dependencies) => {
  const apa = new ethers.Contract(
    dependencies.ajnaProxyActions,
    ajnaProxyActionsAbi,
    dependencies.provider,
  )

  const data = apa.interface.encodeFunctionData('repayWithdraw', [
    args.poolAddress,
    ethers.utils.parseUnits(args.quoteAmount.toString(), args.quoteTokenPrecision).toString(),
    ethers.utils
      .parseUnits(args.collateralAmount.toString(), args.collateralTokenPrecision)
      .toString(),
  ])

  const targetPosition = args.position.payback(args.quoteAmount).withdraw(args.collateralAmount)

  const isPayingBackEth =
    args.position.pool.quoteToken.toLowerCase() === dependencies.WETH.toLowerCase()

  const errors = [
    ...validateDustLimit(targetPosition),
    ...validateWithdrawUndercollateralized(targetPosition, args.position),
    ...validateOverWithdraw(targetPosition, args.position, args.collateralAmount),
    // ...validateOverRepay(args.position, args.quoteAmount),
  ]

  const warnings = [...validateWithdrawCloseToMaxLtv(targetPosition, args.position)]

  return prepareAjnaPayload({
    dependencies,
    targetPosition,
    errors,
    warnings,
    notices: [],
    successes: [],
    data,
    txValue: resolveAjnaEthAction(isPayingBackEth, args.quoteAmount),
  })
}