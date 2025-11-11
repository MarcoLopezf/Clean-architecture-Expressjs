import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1729020000000 implements MigrationInterface {
  name = 'InitSchema1729020000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "billing_cycle_unit" AS ENUM ('day','week','month','year')`
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_status" AS ENUM ('pending','active','paused','cancelled')`
    );
    await queryRunner.query(
      `CREATE TYPE "payment_status" AS ENUM ('pending','completed','failed')`
    );
    await queryRunner.query(
      `CREATE TYPE "promotion_redemption_status" AS ENUM ('pending','applied','revoked','expired')`
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY,
        "email" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "fk_users_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "plans" (
        "id" uuid PRIMARY KEY,
        "name" text NOT NULL,
        "description" text NULL,
        "stripe_product_id" text UNIQUE,
        "default_price_id" uuid NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "fk_plans_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "plan_prices" (
        "id" uuid PRIMARY KEY,
        "plan_id" uuid NOT NULL,
        "stripe_price_id" text UNIQUE,
        "billing_cycle_interval" integer NOT NULL DEFAULT 1,
        "billing_cycle_unit" "billing_cycle_unit" NOT NULL DEFAULT 'month',
        "amount" numeric(12,2) NOT NULL,
        "currency" char(3) NOT NULL,
        "base_amount" numeric(12,2) NULL,
        "discount_percentage" numeric(5,2) NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "fk_plan_prices_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_plan_prices_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_plan_prices_plan" ON "plan_prices" ("plan_id")`);

    await queryRunner.query(`
      ALTER TABLE "plans"
      ADD CONSTRAINT "fk_plans_default_price" FOREIGN KEY ("default_price_id") REFERENCES "plan_prices"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "stripe_customers" (
        "user_id" uuid PRIMARY KEY,
        "stripe_customer_id" text NOT NULL UNIQUE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_stripe_customers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "payment_methods" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "stripe_payment_method_id" text NOT NULL,
        "brand" text NULL,
        "last4" char(4) NULL,
        "exp_month" smallint NULL,
        "exp_year" smallint NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "fk_payment_methods_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_payment_methods_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_payment_methods_default" ON "payment_methods" ("user_id") WHERE is_default = true`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_payment_methods_stripe" ON "payment_methods" ("user_id","stripe_payment_method_id")`
    );

    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "plan_price_id" uuid NOT NULL,
        "stripe_subscription_id" text UNIQUE,
        "stripe_customer_id" text,
        "status" "subscription_status" NOT NULL DEFAULT 'pending',
        "start_date" timestamptz NOT NULL,
        "end_date" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "chk_subscription_dates" CHECK ("end_date" > "start_date"),
        CONSTRAINT "fk_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_subscriptions_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_subscriptions_plan_price" FOREIGN KEY ("plan_price_id") REFERENCES "plan_prices"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_subscriptions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_subscriptions_user" ON "subscriptions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_subscriptions_plan" ON "subscriptions" ("plan_id")`);
    await queryRunner.query(`CREATE INDEX "idx_subscriptions_status" ON "subscriptions" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY,
        "subscription_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "currency" char(3) NOT NULL,
        "status" "payment_status" NOT NULL DEFAULT 'pending',
        "stripe_payment_intent_id" text NULL,
        "stripe_invoice_id" text NULL,
        "stripe_charge_id" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "processed_at" timestamptz NULL,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "fk_payments_subscription" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_payments_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_payments_subscription" ON "payments" ("subscription_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_status" ON "payments" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "promotion_codes" (
        "id" uuid PRIMARY KEY,
        "code" text NOT NULL UNIQUE,
        "stripe_promotion_code_id" text NOT NULL UNIQUE,
        "stripe_coupon_id" text NOT NULL,
        "description" text NULL,
        "applies_to_plan_id" uuid NULL,
        "applies_to_price_id" uuid NULL,
        "max_redemptions" integer NULL,
        "expires_at" timestamptz NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "updated_by" uuid NULL,
        CONSTRAINT "fk_promotion_codes_plan" FOREIGN KEY ("applies_to_plan_id") REFERENCES "plans"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_promotion_codes_price" FOREIGN KEY ("applies_to_price_id") REFERENCES "plan_prices"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_promotion_codes_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "promotion_redemptions" (
        "id" uuid PRIMARY KEY,
        "promotion_code_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "subscription_id" uuid NULL,
        "stripe_promotion_code_id" text NOT NULL,
        "redeemed_at" timestamptz NOT NULL DEFAULT now(),
        "status" "promotion_redemption_status" NOT NULL DEFAULT 'pending',
        CONSTRAINT "fk_promo_redemptions_code" FOREIGN KEY ("promotion_code_id") REFERENCES "promotion_codes"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_promo_redemptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_promo_redemptions_subscription" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_promo_redemption_user" ON "promotion_redemptions" ("promotion_code_id","user_id") WHERE status = 'applied'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_promo_redemption_user"`);
    await queryRunner.query(`DROP TABLE "promotion_redemptions"`);
    await queryRunner.query(`DROP TABLE "promotion_codes"`);
    await queryRunner.query(`DROP INDEX "idx_payments_status"`);
    await queryRunner.query(`DROP INDEX "idx_payments_subscription"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP INDEX "idx_subscriptions_status"`);
    await queryRunner.query(`DROP INDEX "idx_subscriptions_plan"`);
    await queryRunner.query(`DROP INDEX "idx_subscriptions_user"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP INDEX "idx_payment_methods_stripe"`);
    await queryRunner.query(`DROP INDEX "idx_payment_methods_default"`);
    await queryRunner.query(`DROP TABLE "payment_methods"`);
    await queryRunner.query(`DROP TABLE "stripe_customers"`);
    await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "fk_plans_default_price"`);
    await queryRunner.query(`DROP INDEX "idx_plan_prices_plan"`);
    await queryRunner.query(`DROP TABLE "plan_prices"`);
    await queryRunner.query(`DROP TABLE "plans"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "promotion_redemption_status"`);
    await queryRunner.query(`DROP TYPE "payment_status"`);
    await queryRunner.query(`DROP TYPE "subscription_status"`);
    await queryRunner.query(`DROP TYPE "billing_cycle_unit"`);
  }
}
