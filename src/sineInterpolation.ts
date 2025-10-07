import {
    type InterpolationFormulaBase,
    InterpolationTypeEnum,
} from "./interpolationType.ts"

export interface SineInterpolationNewArgs extends InterpolationFormulaBase {
    type: typeof InterpolationTypeEnum.SINE
    timeRange: [number, number]
    amplitude: number
    frequency: number
    phaseShift?: number
    verticalShift?: number
}

export interface SineInterpolationFormula extends InterpolationFormulaBase {
    timeRange: [number, number]
    amplitude: number
    frequency: number
    phaseShift: number
    verticalShift: number
}

export const SineInterpolationService = {
    new: ({
        timeRange,
        amplitude,
        frequency,
        phaseShift,
        verticalShift,
    }: Omit<SineInterpolationNewArgs, "type" | "phaseShift" | "verticalShift"> &
        Partial<
            Pick<SineInterpolationNewArgs, "phaseShift" | "verticalShift">
        >): SineInterpolationFormula => {
        validate({ timeRange: timeRange, amplitude, frequency })

        return {
            type: InterpolationTypeEnum.SINE,
            timeRange,
            amplitude,
            frequency,
            phaseShift: phaseShift ?? 0,
            verticalShift: verticalShift ?? 0,
        }
    },
    calculate: (
        formula: SineInterpolationFormula,
        timeElapsed: number
    ): number => {
        let timeInFormula =
            Math.max(
                Math.min(timeElapsed, formula.timeRange.at(-1)!),
                formula.timeRange[0]
            ) - formula.timeRange[0]

        return calculate({
            amplitude: formula.amplitude,
            phaseShift: formula.phaseShift,
            timeInFormula,
            verticalShift: formula.verticalShift,
            frequency: formula.frequency,
        })
    },
    getTimeElapsed: (formulaSettings: SineInterpolationNewArgs): number => {
        if (formulaSettings == undefined) {
            throw new Error(
                "[SineInterpolationService.getTimeElapsed]: formulaSettings must be defined"
            )
        }
        validateTimeRange(formulaSettings.timeRange)

        return formulaSettings.timeRange.at(-1)! - formulaSettings.timeRange[0]
    },
    deriveStartPointAndEndPointFromArgs: (
        formulaSettings: SineInterpolationNewArgs
    ): {
        startPoint: [number, number]
        endPoint: [number, number]
    } => {
        validate({
            timeRange: formulaSettings.timeRange,
            amplitude: formulaSettings.amplitude,
            frequency: formulaSettings.frequency,
        })

        return {
            startPoint: [
                formulaSettings.timeRange[0],
                calculate({
                    timeInFormula: 0,
                    amplitude: formulaSettings.amplitude,
                    frequency: formulaSettings.frequency,
                    phaseShift: formulaSettings.phaseShift ?? 0,
                    verticalShift: formulaSettings.verticalShift ?? 0,
                }),
            ],
            endPoint: [
                formulaSettings.timeRange[1],
                calculate({
                    timeInFormula:
                        formulaSettings.timeRange[1] -
                        formulaSettings.timeRange[0],
                    amplitude: formulaSettings.amplitude,
                    frequency: formulaSettings.frequency,
                    phaseShift: formulaSettings.phaseShift ?? 0,
                    verticalShift: formulaSettings.verticalShift ?? 0,
                }),
            ],
        }
    },
}

const validate = ({
    timeRange,
    amplitude,
    frequency,
}: {
    timeRange: [number, number]
    amplitude: number
    frequency: number
}) => {
    if (amplitude == undefined) {
        throw new Error(
            "[SineInterpolationService.validate] amplitude must be defined"
        )
    }
    if (frequency == undefined) {
        throw new Error(
            "[SineInterpolationService.validate] frequency must be defined"
        )
    }
    if (frequency <= 0) {
        throw new Error(
            "[SineInterpolationService.validate] frequency must be positive"
        )
    }
    validateTimeRange(timeRange)
}

const validateTimeRange = (timeRange: [number, number]) => {
    if (timeRange == undefined) {
        throw new Error(
            "[SineInterpolationService.validate] timeRange must be defined"
        )
    }
    if (timeRange.length < 2) {
        throw new Error(
            "[SineInterpolationService.validate] timeRange must be defined and not empty"
        )
    }
    const startValue = timeRange[0]
    if (startValue == undefined) {
        throw new Error(
            "[SineInterpolationService.validate] first timeRange must be defined"
        )
    }
    const endValue = timeRange.at(-1)
    if (endValue == undefined) {
        throw new Error(
            "[SineInterpolationService.validate] last timeRange must be defined"
        )
    }
    if (startValue == endValue) {
        throw new Error(
            "[SineInterpolationService.validate] timeRange must have different times"
        )
    }
}

const calculate = ({
    amplitude,
    phaseShift,
    timeInFormula,
    verticalShift,
    frequency,
}: {
    amplitude: number
    phaseShift: number
    timeInFormula: number
    verticalShift: number
    frequency: number
}): number => {
    const frequencyMultiplier = (Math.PI * 2) / frequency
    return (
        amplitude *
            Math.sin(frequencyMultiplier * (timeInFormula + phaseShift)) +
        verticalShift
    )
}
