/** @file Individual User creation with Business Group and Unit fixed from the login session. */
import UserCreate from './UserCreate'

function IndividualUserCreate() {
  return <UserCreate fixedBusinessContext title={'Individual User Create'} />
}

export default IndividualUserCreate
