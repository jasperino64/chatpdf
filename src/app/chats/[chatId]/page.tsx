import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { DownloadIcon, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  const isPro = await checkSubscription();

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* chat sidebar */}
      <aside className="w-72 shrink-0">
        <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
      </aside>

      {/* pdf viewer */}
      <section className="flex min-w-0 flex-[5] flex-col p-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">
                {currentChat?.pdfName}
              </span>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <a
                href={currentChat?.pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
          <div className="min-h-0 flex-1">
            <PDFViewer pdfUrl={currentChat?.pdfUrl || ""} />
          </div>
        </div>
      </section>

      {/* chat component */}
      <section className="flex min-w-[340px] flex-[3] flex-col border-l bg-background">
        <ChatComponent chatId={parseInt(chatId)} />
      </section>
    </div>
  );
};

export default ChatPage;
