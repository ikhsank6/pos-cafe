-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active_role_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_active_role_id_fkey" FOREIGN KEY ("active_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
