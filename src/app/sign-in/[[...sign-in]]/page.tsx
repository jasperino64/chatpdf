import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10rem] -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200 via-violet-200 to-sky-200 opacity-60 blur-3xl"
      />
      <SignIn />
    </div>
  );
}
