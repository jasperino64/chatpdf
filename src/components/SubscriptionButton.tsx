"use client"
import React from "react"
import { Button } from "./ui/button"
import axios from "axios"
import { useToast } from "@/components/hooks/use-toast"

type Props = { isPro: boolean }

const SubscriptionButton = (props: Props) => {
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()
  const handleSubscription = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/stripe")
      window.location.href = response.data.url
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Couldn't open billing",
        description: "Something went wrong reaching Stripe. Please try again.",
      })
      setLoading(false)
    }
  }
  return (
    <Button disabled={loading} onClick={handleSubscription} variant="secondary">
      {props.isPro ? "Manage Subscriptions" : "Get Pro"}
    </Button>
  )
}

export default SubscriptionButton
