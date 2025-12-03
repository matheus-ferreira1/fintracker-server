export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
}
