import Stripe from "stripe";
import stripe from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/client";

export const getPeriodEnd = (payload: Stripe.Subscription) => {
    const currentPeriodEndInMilisecond = payload.items.data[0]?.current_period_end!;
    const currentPeriodEnd = new Date(currentPeriodEndInMilisecond * 1000);
    return currentPeriodEnd;
};

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        console.log("Webhook : Missing values For Creating Checkout Session");
        return;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentPeriodEnd = getPeriodEnd(stripeSubscription);

    await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            currentPeriodEnd
        },
        update: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            currentPeriodEnd
        },
    })
}

export const handleChangeSubscription = async (subscription: Stripe.Subscription) => {
    const stripeCustomerId = subscription.customer as string;
    const stripeSubscriptionId = subscription.id;
    const status = (subscription.status === "active" || subscription.status === "trialing") ? SubscriptionStatus.ACTIVE :
        subscription.status === "canceled" ? SubscriptionStatus.CANCELED :
            SubscriptionStatus.EXPIRED

    const currentPeriodEnd = getPeriodEnd(subscription);

    const isSubscriptionExists = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId }
    });

    if (!isSubscriptionExists) {
        console.log("Webhook : Missing values For Creating Checkout Session");
        return;
    }

    await prisma.subscription.update({
        where: { stripeSubscriptionId },
        data: {
            status,
            currentPeriodEnd
        }
    });
};
