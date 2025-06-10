import { SignUpForm } from "@/components/auth/sign-up-form";

interface SignUpPageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { type } = await searchParams;
  return <SignUpForm userType={type} />;
}
