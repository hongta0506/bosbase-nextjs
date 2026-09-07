"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Chrome } from "lucide-react";

export default function SignInPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/en/admin";
  const authError = searchParams.get("error");
  const [error, setError] = useState(
    authError && authError !== "undefined" ? "Access denied for this admin account." : ""
  );
  const [pending, setPending] = useState(false);

  async function handleCredentialsSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      callbackUrl,
      redirect: false,
    });
    if (result?.error) setError("Invalid admin email or password.");
    else if (result?.url) window.location.assign(result.url);
    setPending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">FI Control Room</p>
          <CardTitle className="text-center text-2xl">Admin Console</CardTitle>
          <CardDescription className="text-center text-slate-400">Sign in with local operator credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleCredentialsSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input className="border-slate-700 bg-slate-950" id="email" name="email" type="email" required autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input className="border-slate-700 bg-slate-950" id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <Button className="w-full" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</Button>
          </form>
          {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
            <Button onClick={() => signIn("google", { callbackUrl })} variant="outline" className="w-full" size="lg">
              <Chrome className="mr-2 h-5 w-5" />
              {t("sign_in_with_google")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
