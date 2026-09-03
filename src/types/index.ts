interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface SignInDTO {
  email: string;
  password: string;
}

export type { CreateUserDTO, SignInDTO };
