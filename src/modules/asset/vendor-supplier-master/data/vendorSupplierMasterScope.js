/**
 * @file The only place the Supplier module reads the Business Group.
 * It reuses the Custodian scope so bgId is read from currentUser in one file.
 * TODO: replace with session bgId/buId when login returns it.
 */
import { custodianBusinessGroup } from '../../custodian/data/custodianScope'

export const supplierBusinessGroup = custodianBusinessGroup
