import dotenv from "dotenv";
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    port: process.env.PORT || 3000,
    databaseUrl: process.env.DATABASE_URL,
    app_url: process.env.APP_URL,
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION as string,
    jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION as string,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY as string,
    stripe_price_id: process.env.STRIPED_PRICE_ID as string,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
}