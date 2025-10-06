export const InterpolationTypeEnum = {
    CONSTANT: "CONSTANT",
    LINEAR: "LINEAR",
} as const satisfies Record<string, string>

export type InterpolationType =
    (typeof InterpolationTypeEnum)[keyof typeof InterpolationTypeEnum]

export interface InterpolationFormula {
    type: InterpolationType
}
