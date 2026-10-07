/** @file Active Custodian reference data for Location Master. */
import { listCustodians } from '../../custodian/data/custodianStore'

export function getLocationMasterReferences() {
  return {
    custodians: listCustodians().filter((record) => record.STATUS === '1'),
  }
}

export function getSubCustodianOptions(custodianId, custodians) {
  return custodians
    .find((record) => record.ID === String(custodianId))
    ?.SUB_CUSTODIANS
    .filter((record) => record.STATUS === '1') ?? []
}
