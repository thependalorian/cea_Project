import { Session } from 'next-auth';

declare module 'next-auth/react' {
  export function useSession(): {
    data: Session & {
      accessToken?: string;
    };
    status: 'authenticated' | 'unauthenticated' | 'loading';
  };
} 