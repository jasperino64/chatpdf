"use client"
import { useToast } from "@/components/hooks/use-toast"
import { uploadToS3 } from "@/lib/s3"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { cn } from "@/lib/utils"
import { Loader2, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { useDropzone } from "react-dropzone"

type Props = {}

const FileUpload = (props: Props) => {
  const router = useRouter()
  const { toast } = useToast()
  const [uploading, setUploading] = React.useState(false)
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string
      file_name: string
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      })
      return response.data
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      // console.log(acceptedFiles)
      const file = acceptedFiles[0]
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 10MB",
        })
        return
      }
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "File type must be PDF",
        })
        return
      }

      try {
        setUploading(true)
        const data = await uploadToS3(file)
        if (!data?.file_key || !data?.file_name) {
          toast({
            variant: "destructive",
            title: "Failed to upload file",
          })
          return
        }
        toast({
          title: data.file_name + " File uploaded successfully",
        })
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast({
              title: "Success",
              description: "Chat created successfully",
            })
            router.push(`/chats/${chat_id}`)
          },
          onError: (err) => {
            toast({
              variant: "destructive",
              title: "Failed to create chat" + err,
            })
            console.error(err)
          },
        })
      } catch (error) {
        alert("Failed to upload file")
        return
      } finally {
        setUploading(false)
      }
    },
  })
  const busy = uploading || isPending
  return (
    <div
      {...getRootProps()}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-12 transition-colors hover:border-primary/50 hover:bg-primary/5",
        isDragActive && "border-primary bg-primary/5",
        busy && "pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <UploadCloud className="h-6 w-6" />
        )}
      </div>
      {busy ? (
        <>
          <p className="mt-4 text-sm font-medium">Processing your PDF...</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This can take a few seconds
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm font-medium">
            {isDragActive ? "Drop it here" : "Drop your PDF here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · PDF up to 10MB
          </p>
        </>
      )}
    </div>
  )
}

export default FileUpload
