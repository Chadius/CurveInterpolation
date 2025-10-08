export const InterpolationTypeEnum = {
    CONSTANT: "CONSTANT",
    LINEAR: "LINEAR",
    SINE: "SINE",
    QUADRATIC: "QUADRATIC",
} as const satisfies Record<string, string>

export type InterpolationType =
    (typeof InterpolationTypeEnum)[keyof typeof InterpolationTypeEnum]

export interface InterpolationFormulaBase {
    type: InterpolationType
}
