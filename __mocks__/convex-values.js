// Mock for convex/values
module.exports = {
  v: {
    string: () => 'string',
    number: () => 'number',
    boolean: () => 'boolean',
    null: () => 'null',
    any: () => 'any',
    optional: (type) => `optional(${type})`,
    union: (...types) => `union(${types.join(', ')})`,
    literal: (value) => `literal(${value})`,
    array: (type) => `array(${type})`,
    object: (schema) => `object(${JSON.stringify(schema)})`,
    id: (table) => `id(${table})`,
  },
};
