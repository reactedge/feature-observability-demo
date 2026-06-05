export function flattenAttributes(
    prefix: string,
    data: Record<string, unknown>
): Record<string, string | number | boolean> {

    const attributes: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(data)) {

        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            attributes[
                `${prefix}.${key}`
                ] = value;
        }
    }

    return attributes;
}