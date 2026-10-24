export const string = { type: 'string' };
export const object = (properties: Record<string, unknown>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const array = (items: unknown) => ({ type: 'array', items });
