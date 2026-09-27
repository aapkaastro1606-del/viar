import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center">
          <p className="font-semibold text-sm">⚠️ Authentication Misconfigured</p>
          <p className="text-xs text-slate-400 mt-2">
            <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> is missing from environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
