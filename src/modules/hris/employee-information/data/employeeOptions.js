/**
 * @file Reusable option and temporary reference data for Employee Information.
 * Sections: exported option collections and lookup records consumed by pages/forms.
 * Replace temporary collections with API-shaped data without changing consumer contracts unnecessarily.
 */
export const businessUnitOptions = [
  { value: '1', label: 'Demo Business Unit' },
  { value: '2', label: 'Corporate Office' },
]

export const departmentOptions = [
  { value: '1', label: 'Human Resources', businessUnitId: '1' },
  { value: '2', label: 'Finance & Accounts', businessUnitId: '1' },
  { value: '3', label: 'Administration', businessUnitId: '2' },
]

export const designationOptions = [
  { value: '1', label: 'HR Executive' },
  { value: '2', label: 'Manager' },
  { value: '3', label: 'Senior Officer' },
]

export const employmentTypeOptions = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'CONTRACTUAL', label: 'Contractual' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'PART-TIME', label: 'Part-Time' },
]

export const employmentStatusOptions = [
  { value: 'PROBATION', label: 'Probation' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'RESIGNED', label: 'Resigned' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'ON-LEAVE', label: 'On Leave' },
]

export const shiftOptions = [
  { value: '1', label: 'General Shift' },
  { value: '2', label: 'Morning Shift' },
  { value: '3', label: 'Evening Shift' },
]

export const reportingOfficerOptions = [
  { value: '101', employeeId: 'EMP-0101', name: 'Samira Rahman', department: 'Human Resources', designation: 'Manager' },
  { value: '102', employeeId: 'EMP-0102', name: 'Tanvir Hasan', department: 'Administration', designation: 'Senior Officer' },
]

export const genderOptions = ['Male', 'Female', 'Other']
export const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed']
export const religionOptions = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other']
export const nationalityOptions = ['Bangladeshi', 'Other']
export const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const educationLevelOptions = ['SSC', 'HSC', 'Diploma', 'Bachelor', 'Master', 'Doctorate']
export const degreeTitleOptions = ['SSC', 'HSC', 'BBA', 'BSc', 'BA', 'MBA', 'MSc', 'MA', 'PhD']
export const boardOptions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Barisal', 'Comilla', 'Jessore', 'Mymensingh', 'Sylhet', 'Other']
export const resultOptions = ['First Division', 'Second Division', 'Third Division', 'Passed', 'CGPA']
export const disabilityTypeOptions = ['Physical', 'Visual', 'Hearing', 'Speech', 'Intellectual', 'Multiple', 'Other']
export const countryOptions = ['Bangladesh', 'India', 'Malaysia', 'Singapore', 'United Kingdom', 'United States', 'Other']
export const thanaOptions = ['Kotwali', 'Paltan', 'Gulshan', 'Banani', 'Dhanmondi', 'Mirpur', 'Uttara', 'Mohammadpur', 'Tejgaon', 'Rampura']
export const districtOptions = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur',
  'Chapai Nawabganj', 'Chattogram', 'Chuadanga', 'Cox’s Bazar', 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur',
  'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati',
  'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur',
  'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh',
  'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali',
  'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur',
  'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon',
]

export const toSelectOptions = (items) => items.map((item) => (
  typeof item === 'string' ? { value: item, label: item } : item
))
