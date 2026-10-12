/**
 * @file The only place the Custodian module reads the Business Group.
 * TODO: replace with session bgId/buId when login returns it.
 */
import { currentUser } from '../../../../app/currentUser'

export const custodianBusinessGroup = {
  ID: String(currentUser.businessGroup.id),
  GROUP_NAME: currentUser.businessGroup.name,
}
