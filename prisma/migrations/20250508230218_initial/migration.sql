-- CreateTable
CREATE TABLE "ArbitraryData" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArbitraryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TxnLink" (
    "id" SERIAL NOT NULL,
    "txnId" TEXT NOT NULL,
    "dataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TxnLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArbitraryData_id_key" ON "ArbitraryData"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TxnLink_id_key" ON "TxnLink"("id");

-- AddForeignKey
ALTER TABLE "TxnLink" ADD CONSTRAINT "TxnLink_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "ArbitraryData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
