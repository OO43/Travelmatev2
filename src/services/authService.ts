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
      user: { id: 'passenger-001', email: DEMO_EMAIL, name: 'Ooreoluwa' },
    },
  };
}
