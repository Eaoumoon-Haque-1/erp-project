/**
 * @file Temporary development flags. Remove or switch off when testing is finished.
 */
export const RELAX_REQUIRED = true // TODO: set to false (or remove) when testing is finished

/**
 * True when a field must be filled client-side. Used only by the Custodian,
 * Location Master and Supplier validation/forms. Ids needed to build the
 * request (Business Unit, dropdown ids) must not use this helper.
 */
export const isRequired = () => !RELAX_REQUIRED
