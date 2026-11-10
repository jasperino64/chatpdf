import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { UserButton, auth } from "@clerk/nextjs"
import {
  ArrowRight,
  FileText,
  LogIn,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import SubscriptionButton from "@/components/SubscriptionButton"
import { checkSubscription } from "@/lib/subscription"

const features = [
  {
    icon: Zap,
    title: "Instant answers",
    text: "Ask in plain language and get answers pulled straight from your document.",
  },
  {
    icon: FileText,
    title: "Side-by-side reading",
    text: "Keep the PDF open next to the conversation while you dig in.",
  },
  {
    icon: MessageSquare,
    title: "Every chat saved",
    text: "Come back to any document and pick up right where you left off.",
  },
]

export default async function Home() {
  const { userId } = await auth()
  const isPro = await checkSubscription()
  let needToSubscribe = false
  let firstchat
  if (userId) {
    let userchats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
    if (userchats.length > 0) {
      firstchat = userchats[0]
    }

    if (userchats.length > 2 && !isPro) {
      needToSubscribe = true
    }
  }

  const isAuth = !!userId

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      {/* background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10rem] h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200 via-violet-200 to-sky-200 opacity-60 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      </div>

      {/* nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-4 w-4" />
          </span>
          ChatPDF
        </Link>
        {isAuth ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        )}
      </header>

      {/* hero */}
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered document chat
        </span>

        <h1 className="mt-6 [text-wrap:balance] text-5xl font-bold tracking-tight sm:text-6xl">
          Chat with any{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            PDF
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Upload a document and ask it anything. Research papers, contracts,
          manuals: get answers in seconds instead of scrolling for minutes.
        </p>

        {isAuth && firstchat && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-lg shadow-primary/25">
              <Link href={`/chats/${firstchat.id}`}>
                Go to chats <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <SubscriptionButton isPro={isPro} size="lg" variant="outline" />
          </div>
        )}

        <div className="mt-10 w-full">
          {isAuth ? (
            needToSubscribe ? (
              <div className="rounded-2xl border bg-card/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">
                  You&apos;ve used all your free chats
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upgrade to Pro to keep uploading documents.
                </p>
                <div className="mt-6">
                  <SubscriptionButton isPro={isPro} />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border bg-card/80 p-2 shadow-xl shadow-indigo-500/5 backdrop-blur">
                <FileUpload />
              </div>
            )
          ) : (
            <Button asChild size="lg" className="shadow-lg shadow-primary/25">
              <Link href="/sign-in">
                Log in to get started
                <LogIn className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* features */}
        <div className="mt-20 grid w-full gap-4 text-left sm:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border bg-card/60 p-5 backdrop-blur"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
