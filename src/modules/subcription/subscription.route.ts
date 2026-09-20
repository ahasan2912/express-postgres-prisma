import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post("/checkout", auth(Role.USER, Role.ADMIN, Role.AUTHOR), subscriptionController.CreateCheckout);
router.post("/webhook", subscriptionController.handleWebhook);
router.get("/status", auth(Role.USER, Role.ADMIN, Role.AUTHOR), subscriptionController.getSubscriptionStatus);

export const subscriptionRouter = router;