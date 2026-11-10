"use client"
import { DrizzleChat } from "@/lib/db/schema"
import Link from "next/link"
import React from "react"
import { Button } from "./ui/button"
import { FileText, Home, LogOut, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import SubscriptionButton from "./SubscriptionButton"
import { SignOutButton } from "@clerk/nextjs"

type Props = {
  chats: DrizzleChat[]
  chatId: number
  isPro: boolean
}

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 text-zinc-400">
      <div className="space-y-4 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-1 font-semibold text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </span>
          ChatPDF
        </Link>
        <Button
          asChild
          className="w-full justify-start border border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            New chat
          </Link>
        </Button>
      </div>

      <p className="px-5 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        Your documents
      </p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {chats.map((chat) => {
          const active = chat.id === chatId
          return (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/5 hover:text-zinc-100"
              )}
            >
              <FileText
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-indigo-400" : "text-zinc-500"
                )}
              />
              <span className="truncate">{chat.pdfName}</span>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        {isPro && (
          <SubscriptionButton
            isPro={isPro}
            variant="ghost"
            className="w-full justify-start text-zinc-300 hover:bg-white/5 hover:text-white"
          />
        )}
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <SignOutButton signOutCallback={() => {
            window.location.href = "/"
          }}>
          <Button
            variant="ghost"
            className="w-full justify-start text-zinc-300 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  )
}

export default ChatSideBar
