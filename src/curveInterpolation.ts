import {
    type LinearInterpolationFormula,
    type LinearInterpolationNewArgs,
    LinearInterpolationService,
} from "./linearInterpolation"
import { InterpolationTypeEnum } from "./interpolationType"
import {
    type ConstantInterpolationFormula,
    type ConstantInterpolationNewArgs,
    ConstantInterpolationService,
} from "./constantInterpolation.ts"
import {
    type SineInterpolationFormula,
    type SineInterpolationNewArgs,
    SineInterpolationService,
} from "./sineInterpolation.ts"
import {
    type QuadraticInterpolationFormula,
    type QuadraticInterpolationNewArgs,
    QuadraticInterpolationService,
} from "./quadraticInterpolation.ts"

type TimeBandsDescription = {
    easeIn?: [number, number]
    main: [number, number]
    easeOut?: [number, number]
}
export interface CurveInterpolation {
    main: InterpolationFormula
    timeBandsRealTime: TimeBandsDescription
    timeBandsFormulaTime: TimeBandsDescription
}

type InterpolationFormula =
    | ConstantInterpolationFormula
    | LinearInterpolationFormula
    | QuadraticInterpolationFormula
    | SineInterpolationFormula

export type CurveInterpolationNewArgs =
    | ConstantInterpolationNewArgs
    | LinearInterpolationNewArgs
    | QuadraticInterpolationNewArgs
    | SineInterpolationNewArgs

export const CurveInterpolationService = {
    new: ({
        formulaSettings,
        easeIn,
        easeOut,
    }: {
        formulaSettings: CurveInterpolationNewArgs
        easeIn?: {
            realTime: number
            formulaTime: number
        }
        easeOut?: {
            realTime: number
            formulaTime: number
        }
    }): CurveInterpolation => {
        let timeElapsed: number | undefined = undefined
        switch (formulaSettings.type) {
            case InterpolationTypeEnum.LINEAR:
                timeElapsed =
                    LinearInterpolationService.getTimeElapsed(formulaSettings)
                break
            case InterpolationTypeEnum.QUADRATIC:
                timeElapsed =
                    QuadraticInterpolationService.getTimeElapsed(
                        formulaSettings
                    )
                break
            case InterpolationTypeEnum.SINE:
                timeElapsed =
                    SineInterpolationService.getTimeElapsed(formulaSettings)
                break
        }
        if (timeElapsed != undefined) {
            verifyEaseInOutTimeElapsed({
                timeElapsed,
                easeIn,
                easeOut,
            })
        }

        const { startPoint, endPoint } =
            deriveAllPointsFromArgs(formulaSettings)

        const formulaWithoutEasing = newInterpolationFormula(formulaSettings)

        let timeBandsRealTime: TimeBandsDescription = {
            main: [startPoint[0], endPoint[0]],
            easeIn: undefined,
            easeOut: undefined,
        }

        let timeBandsFormulaTime: TimeBandsDescription = {
            main: [startPoint[0], endPoint[0]],
            easeIn: undefined,
            easeOut: undefined,
        }

        if (easeIn) {
            timeBandsRealTime.easeIn = [
                startPoint[0],
                startPoint[0] + easeIn.realTime,
            ]
            timeBandsRealTime.main[0] = timeBandsRealTime.easeIn[1]
            timeBandsFormulaTime.easeIn = [
                startPoint[0],
                startPoint[0] + easeIn.formulaTime,
            ]
            timeBandsFormulaTime.main[0] = timeBandsFormulaTime.easeIn[1]
        }

        if (easeOut) {
            timeBandsRealTime.easeOut = [
                endPoint[0] - easeOut.realTime,
                endPoint[0],
            ]
            timeBandsRealTime.main[1] = timeBandsRealTime.easeOut[0]
            timeBandsFormulaTime.easeOut = [
                endPoint[0] - easeOut.formulaTime,
                endPoint[0],
            ]
            timeBandsFormulaTime.main[1] = timeBandsFormulaTime.easeOut[0]
        }

        return {
            main: formulaWithoutEasing,
            timeBandsRealTime,
            timeBandsFormulaTime,
        }
    },
    calculate: (formula: CurveInterpolation, time: number) =>
        calculate(formula, time),
    getStartPoint: (formula: CurveInterpolation): [number, number] => {
        const startRealTime = Math.min(
            ...[
                formula.timeBandsRealTime.main[0],
                formula.timeBandsRealTime.easeIn?.[0],
                formula.timeBandsRealTime.easeOut?.[0],
            ].filter((x) => x != undefined)
        )

        return [startRealTime, calculate(formula, startRealTime)]
    },
    getEndPoint: (formula: CurveInterpolation): [number, number] => {
        const endRealTime = Math.max(
            ...[
                formula.timeBandsRealTime.main[1],
                formula.timeBandsRealTime.easeIn?.[1],
                formula.timeBandsRealTime.easeOut?.[1],
            ].filter((x) => x != undefined)
        )

        return [endRealTime, calculate(formula, endRealTime)]
    },
}

const verifyEaseIn = ({
    easeIn,
    timeElapsed,
}: {
    easeIn?: {
        realTime: number
        formulaTime: number
    }
    timeElapsed: number
}) => {
    if (easeIn == undefined) return

    switch (true) {
        case easeIn.realTime < 0 || easeIn.formulaTime < 0:
            throw new Error(
                "[CurveInterpolationService.verifyEaseIn]: easeIn times must be non-negative"
            )
        case easeIn.realTime > timeElapsed || easeIn.formulaTime > timeElapsed:
            throw new Error(
                "[CurveInterpolationService.verifyEaseIn]: easeIn times must be less than the total time"
            )
    }
}

const verifyEaseOut = ({
    easeOut,
    timeElapsed,
}: {
    easeOut?: {
        realTime: number
        formulaTime: number
    }
    timeElapsed: number
}) => {
    if (easeOut == undefined) return

    switch (true) {
        case easeOut.realTime < 0 || easeOut.formulaTime < 0:
            throw new Error(
                "[CurveInterpolationService.verifyEaseOut]: easeOut times must be non-negative"
            )
        case easeOut.realTime > timeElapsed ||
            easeOut.formulaTime > timeElapsed:
            throw new Error(
                "[CurveInterpolationService.verifyEaseOut]: easeOut times must be less than the total time"
            )
    }
}

const verifyEaseInAndEaseOut = ({
    easeOut,
    easeIn,
    timeElapsed,
}: {
    easeIn?: {
        realTime: number
        formulaTime: number
    }
    easeOut?: {
        realTime: number
        formulaTime: number
    }
    timeElapsed: number
}) => {
    if (easeIn == undefined || easeOut == undefined) return

    if (
        easeIn.realTime + easeOut.realTime > timeElapsed ||
        easeIn.formulaTime + easeOut.formulaTime > timeElapsed
    ) {
        throw new Error(
            "[CurveInterpolationService.verifyEaseInAndEaseOut]: easeIn + easeOut times must be less than the total time"
        )
    }
}

const verifyEaseInOutTimeElapsed = ({
    timeElapsed,
    easeIn,
    easeOut,
}: {
    timeElapsed: number
    easeIn?: {
        realTime: number
        formulaTime: number
    }
    easeOut?: {
        realTime: number
        formulaTime: number
    }
}) => {
    verifyEaseIn({
        easeIn: easeIn,
        timeElapsed: timeElapsed,
    })
    verifyEaseOut({
        easeOut: easeOut,
        timeElapsed: timeElapsed,
    })
    verifyEaseInAndEaseOut({
        easeOut: easeOut,
        easeIn: easeIn,
        timeElapsed: timeElapsed,
    })
}

const calculateInterpolationFormula = (
    interpolation: InterpolationFormula,
    time: number
): number => {
    switch (interpolation.type) {
        case InterpolationTypeEnum.CONSTANT:
            return ConstantInterpolationService.calculate(
                interpolation as ConstantInterpolationFormula
            )
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.calculate(
                interpolation as LinearInterpolationFormula,
                time
            )
        case InterpolationTypeEnum.QUADRATIC:
            return QuadraticInterpolationService.calculate(
                interpolation as QuadraticInterpolationFormula,
                time
            )
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.calculate(
                interpolation as SineInterpolationFormula,
                time
            )
        default:
            throw new Error(
                "[CurveInterpolationService.calculateInterpolationFormula]: Unsupported interpolation type"
            )
    }
}

const newInterpolationFormula = (
    formulaSettings: CurveInterpolationNewArgs
): InterpolationFormula => {
    switch (formulaSettings.type) {
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.new(formulaSettings)
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.new(formulaSettings)
        case InterpolationTypeEnum.CONSTANT:
            return ConstantInterpolationService.new(formulaSettings)
        case InterpolationTypeEnum.QUADRATIC:
            return QuadraticInterpolationService.new(formulaSettings)
        default:
            throw new Error(
                "[newInterpolationFormula]: unknown Interpolation type"
            )
    }
}

const calculate = (formula: CurveInterpolation, time: number): number => {
    let calculatedTime: number
    let realTime = {
        sinceStartOfBand: time - formula.timeBandsRealTime.main[0],
        bandDuration:
            formula.timeBandsRealTime.main[1] -
            formula.timeBandsRealTime.main[0],
    }
    let formulaTime = {
        startOfBand: formula.timeBandsFormulaTime.main[0],
        bandDuration:
            formula.timeBandsFormulaTime.main[1] -
            formula.timeBandsFormulaTime.main[0],
    }

    if (
        formula.timeBandsFormulaTime.easeIn != undefined &&
        formula.timeBandsRealTime.easeIn != undefined &&
        time < formula.timeBandsRealTime.easeIn[1]
    ) {
        realTime.sinceStartOfBand = time - formula.timeBandsRealTime.easeIn[0]
        realTime.bandDuration =
            formula.timeBandsRealTime.easeIn[1] -
            formula.timeBandsRealTime.easeIn[0]
        formulaTime.startOfBand = formula.timeBandsFormulaTime.easeIn[0]
        formulaTime.bandDuration =
            formula.timeBandsFormulaTime.easeIn[1] -
            formula.timeBandsFormulaTime.easeIn[0]
    }

    if (
        formula.timeBandsFormulaTime.easeOut != undefined &&
        formula.timeBandsRealTime.easeOut != undefined &&
        time > formula.timeBandsRealTime.easeOut[0]
    ) {
        realTime.sinceStartOfBand = time - formula.timeBandsRealTime.easeOut[0]
        realTime.bandDuration =
            formula.timeBandsRealTime.easeOut[1] -
            formula.timeBandsRealTime.easeOut[0]
        formulaTime.bandDuration =
            formula.timeBandsFormulaTime.easeOut[1] -
            formula.timeBandsFormulaTime.easeOut[0]
        formulaTime.startOfBand = formula.timeBandsFormulaTime.easeOut[0]
    }

    const formulaTimeSinceStartOfBand =
        (realTime.sinceStartOfBand * formulaTime.bandDuration) /
        realTime.bandDuration
    calculatedTime = formulaTimeSinceStartOfBand + formulaTime.startOfBand

    return calculateInterpolationFormula(formula.main, calculatedTime)
}

const deriveAllPointsFromArgs = (
    formulaSettings: CurveInterpolationNewArgs
) => {
    switch (formulaSettings.type) {
        case InterpolationTypeEnum.CONSTANT:
            return ConstantInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        case InterpolationTypeEnum.LINEAR:
            return LinearInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        case InterpolationTypeEnum.QUADRATIC:
            return QuadraticInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        case InterpolationTypeEnum.SINE:
            return SineInterpolationService.deriveAllPointsFromArgs(
                formulaSettings
            )
        default:
            throw new Error("Unknown type")
    }
}
