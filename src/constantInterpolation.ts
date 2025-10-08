import {
    type InterpolationFormulaBase,
    InterpolationTypeEnum,
} from "./interpolationType"

export interface ConstantInterpolationNewArgs extends InterpolationFormulaBase {
    type: typeof InterpolationTypeEnum.CONSTANT
    value: number
}

export interface ConstantInterpolationFormula extends InterpolationFormulaBase {
    value: number
}

export const ConstantInterpolationService = {
    new: ({
        value,
    }: Omit<
        ConstantInterpolationNewArgs,
        "type"
    >): ConstantInterpolationFormula => {
        sanitize({
            value,
        })

        return {
            type: InterpolationTypeEnum.CONSTANT,
            value,
        }
    },
    calculate: (formula: ConstantInterpolationFormula): number => {
        return formula.value
    },
    deriveAllPointsFromArgs: (
        args: ConstantInterpolationNewArgs
    ): {
        startPoint: [number, number]
        endPoint: [number, number]
    } => {
        return {
            startPoint: [0, args.value],
            endPoint: [0, args.value],
        }
    },
}

const sanitize = ({ value }: { value: number }) => {
    if (value == undefined) {
        throw new Error(
            "[ConstantInterpolationFormula.new]: value must be defined"
        )
    }
}
