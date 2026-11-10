import { cn } from "@/lib/utils"
import { Loader2, MessageSquare, Sparkles } from "lucide-react"
import React from "react"
import { Message } from "ai"

type Props = {
  isLoading: boolean
  isResponding?: boolean
  messages: Message[]
}

const AssistantAvatar = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
    <Sparkles className="h-3.5 w-3.5" />
  </div>
)

const MessageList = ({ messages, isLoading, isResponding }: Props) => {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!messages || messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageSquare className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-medium">Start the conversation</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ask for a summary, key points, or anything specific in the PDF.
        </p>
      </div>
    )
  }

  const awaitingReply =
    isResponding && messages[messages.length - 1]?.role === "user"

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      {messages.map((message: Message) => {
        const isUser = message.role === "user"
        return (
          <div
            key={message.id}
            className={cn("flex gap-3", {
              "justify-end pl-10": isUser,
              "justify-start pr-6": !isUser,
            })}
          >
            {!isUser && <AssistantAvatar />}
            <div
              className={cn(
                "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                isUser
                  ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
                  : "rounded-tl-md bg-muted text-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        )
      })}
      {awaitingReply && (
        <div className="flex gap-3">
          <AssistantAvatar />
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-muted px-4 py-3">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageList
