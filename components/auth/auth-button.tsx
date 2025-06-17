import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";
import { createClient } from "@/lib/supabase/server";

export async function AuthButton() {
  // Use server-side Supabase client with proper cookie handling
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
