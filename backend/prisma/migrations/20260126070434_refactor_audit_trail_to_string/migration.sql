-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_created_by_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_created_by_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_created_by_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_created_by_fkey";
