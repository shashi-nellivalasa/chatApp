export interface AccountModel {
  uid?: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl?: string;
  password?: 'string';
  confirmPassword?: 'string';
  createdAt?: Date | string;
}

export interface usersModel {
  _id: string; // The backend uses _id
  userName: string;
  firstName?: string;
  lastName?: string;
  profilePicUrl?: string; // Optional field for the user's avatar
  added?: boolean;
  status?: string;
}
