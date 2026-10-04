import type { LoginCredentials, LoginResult } from '@/models/auth';

const DEMO_EMAIL = 'oore@travelmate.com';
const DEMO_PASSWORD = 'password123';

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (credentials.email.toLowerCase() !== DEMO_EMAIL || credentials.password !== DEMO_PASSWORD) {
    return { success: false, message: 'Incorrect email address or password.' };
  }

  return {
    success: true,
    session: {
      token: 'travelmate-demo-token',
      user: { id: 'passenger-001', email: DEMO_EMAIL, name: 'Oore' },
    },
  };
}

export type SignUpCredentials = {
  name: string;
  email: string;
  password: string;
};

export async function signUp(
  credentials: SignUpCredentials,
): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const name = credentials.name.trim();
  const email = credentials.email.trim().toLowerCase();

  if (!name || !email || !credentials.password) {
    return {
      success: false,
      message: 'Please complete all fields.',
    };
  }

  return {
    success: true,
    session: {
      token: 'travelmate-demo-token',
      user: {
        id: 'passenger-demo-signup',
        email,
        name,
      },
    },
  };
}