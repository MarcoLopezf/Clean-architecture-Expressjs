import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1729021000000 implements MigrationInterface {
  name = 'AddUserRole1729021000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM ('admin','operator','user')`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "role" "user_role" NOT NULL DEFAULT 'user'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "user_role"`);
  }
}
