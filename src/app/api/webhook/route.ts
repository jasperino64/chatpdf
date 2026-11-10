import { db } from "@/lib/db"
import { userSubscriptions } from "@/lib/db/schema"
import { stripe } from "@/lib/stripe"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string
    )
  } catch (error) {
    console.error("stripe webhook signature verification failed", error)
    return new NextResponse("webhook error", { status: 400 })
  }

  try {
    switch (event.type) {
      // new subscription created (first time, or re-subscribing after cancel)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) {
          return new NextResponse("no userid", { status: 400 })
        }
        if (!session.subscription) {
          break
        }
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const values = {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        }
        // upsert: a returning user already has a row (unique on user_id)
        await db
          .insert(userSubscriptions)
          .values({ userId, ...values })
          .onConflictDoUpdate({ target: userSubscriptions.userId, set: values })
        break
      }

      // subscription renewed
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) {
          break
        }
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )
        await updateFromSubscription(subscription)
        break
      }

      // plan changed, cancelled, or ended
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await updateFromSubscription(event.data.object as Stripe.Subscription)
        break
      }
    }
  } catch (error) {
    console.error(`stripe webhook handler failed for ${event.type}`, error)
    return new NextResponse("webhook handler error", { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}

async function updateFromSubscription(subscription: Stripe.Subscription) {
  const ended = subscription.status === "canceled"
  await db
    .update(userSubscriptions)
    .set({
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: ended
        ? new Date((subscription.ended_at ?? subscription.current_period_end) * 1000)
        : new Date(subscription.current_period_end * 1000),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id))
}
