export interface Room {
  _id?: string;
  participants: string[]; // Array of User IDs
  lastMessage?: string;
  updatedAt?: Date;
}
