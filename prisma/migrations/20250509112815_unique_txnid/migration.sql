/*
  Warnings:

  - A unique constraint covering the columns `[txnId]` on the table `TxnLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TxnLink_txnId_key" ON "TxnLink"("txnId");
