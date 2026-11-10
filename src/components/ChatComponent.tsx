"use client"
import React from "react"
import { Input } from "./ui/input"
import { useChat } from "ai/react"
import { Button } from "./ui/button"
import { ArrowUp } from "lucide-react"
import MessageList from "./MessageList"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post("/api/get-messages", {
        chatId,
      })
      return response.data
    },
  })
  const messageContainer = React.useRef<HTMLDivElement>(null)

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading: isResponding,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  })

  React.useEffect(() => {
    messageContainer.current?.scrollTo({
      top: messageContainer.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b px-5 py-3">
        <h3 className="text-sm font-semibold">Chat</h3>
        <p className="text-xs text-muted-foreground">
          Ask questions about this document
        </p>
      </div>

      {/* messages */}
      <div ref={messageContainer} className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isResponding={isResponding}
        />
      </div>

      {/* input */}
      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-xl border bg-background p-1.5 pl-3 shadow-sm transition-shadow focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="h-9 border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg"
            disabled={!input.trim() || isResponding}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent
