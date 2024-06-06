require('dotenv').config()

const Admin = process.env.ADMIN_ROLE;
const User = process.env.USER_ROLE;
const Owner = process.env.OWNER_ROLE;
const Staff = process.env.STAFF_ROLE;

const Petrol = 'PETROL';
const Diesel = 'DIESEL';
const Gas = 'GAS';

const Male = 'MALE';
const Female = 'FEMALE';
const Others  = 'OTHERS';

const Booked = 'BOOKED';
const Blocked = 'BLOCKED';
const Available = 'AVAILABLE';  
const Occupied = 'OCCUPIED';
const Unavailable = 'UNAVAILABLE';
const Pending = 'PENDING';
const Cancelled = 'CANCELLED';

module.exports={Admin, User, Owner,Petrol, Diesel, Gas, Staff, Male, Female, Others, Unavailable, Pending,Cancelled,Booked, Blocked, Available,Occupied,}