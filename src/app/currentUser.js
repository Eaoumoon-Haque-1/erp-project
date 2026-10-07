/**
 * @file Temporary authenticated-user/session fixture.
 * Sections: current role and business-group context used by menus/forms.
 * Replace this object with authenticated API/session state when backend login is integrated.
 */
// Temporary session data until authentication is supplied by the API.
export const currentUser = {
  role: 'SUPER_ADMIN',
  businessGroup: {
    id: '1',
    name: 'Health Expert',
  },
}
