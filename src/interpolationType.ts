export const InterpolationTypeEnum = {
    LINEAR: "LINEAR",
} as const satisfies Record<string, string>

export type InterpolationType =
    (typeof InterpolationTypeEnum)[keyof typeof InterpolationTypeEnum]
