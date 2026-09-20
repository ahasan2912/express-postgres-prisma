import { NextFunction, Request, Response, Router } from "express";
import { premiumController } from "./premium.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";
import { subscriptionGaurd } from "../../middlewares/premiumGaurd";

const router = Router();

router.get("/",auth(Role.USER, Role.ADMIN, Role.AUTHOR), 
subscriptionGaurd,  premiumController.getPremiumContent);

export const premiumRouter = router;