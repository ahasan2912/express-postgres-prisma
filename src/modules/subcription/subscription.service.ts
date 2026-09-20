import { Stripe } from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/client";
import { handleChangeSubscription, handleCheckoutCompleted } from "./subscription.utils";

const createCheckOutIntoDB = async (userId: string) => {

    const transectionResult = await prisma.$transaction(
        async (tx) => {
            const user = await tx.user.findUniqueOrThrow({
                where: { id: userId },
                include: {
                    subscriptions: true,
                },
            });

            let stripeCustomerId = user.subscriptions?.stripeCustomerId;

            if (!stripeCustomerId) {
                // new subscriber
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: {
                        userId: user.id,
                    },
                });

                stripeCustomerId = customer.id;
            }

            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: config.stripe_price_id,
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                customer: stripeCustomerId,
                payment_method_types: ["card"],
                success_url: `${config.app_url}/success`, // depend frontend developer
                cancel_url: `${config.app_url}/cancel`, // depend frontend developer
                metadata: {
                    userId: user.id,
                },
            });
            return session.url;
        });

    return {
        paymentUrl: transectionResult,
    }
};

const handleWebhook = async (payload: Buffer, signature: string) => {
    const endpointSecret = config.stripe_webhook_secret;

    const event = stripe.webhooks.constructEvent(
        payload,
        signature as string,
        endpointSecret
    );

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
            break;
        case 'customer.subscription.updated':
            await handleChangeSubscription(event.data.object as Stripe.Subscription);
            break;
        case 'customer.subscription.deleted':
            await handleChangeSubscription(event.data.object as Stripe.Subscription);
            break;
        default:
            // Unexpected event type
            console.log(`No Event Handler for event type ${event.type}.`);
            break;
    }
};

const getSubscriptionStatusIntoDB = async(userId: string) => {
    const isSubscriptionExist = await prisma.subscription.findFirst({
        where: {
            userId: userId,
        }
    });

    const isActive = isSubscriptionExist?.status === SubscriptionStatus.ACTIVE && isSubscriptionExist.currentPeriodEnd && new Date(isSubscriptionExist.currentPeriodEnd) > new Date();

    return {
        status: isSubscriptionExist?.status,
        isSubscribed: isActive,
        currentPeriodEnd: isSubscriptionExist?.currentPeriodEnd,
    }
}

export const subscriptionService = {
    createCheckOutIntoDB,
    handleWebhook,
    getSubscriptionStatusIntoDB
};