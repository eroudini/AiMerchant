-- CreateTable
CREATE TABLE `ForecastRun` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `channel` VARCHAR(191) NULL,
    `horizon` INTEGER NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `metricsJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForecastResult` (
    `id` VARCHAR(191) NOT NULL,
    `runId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `yhat` DOUBLE NOT NULL,
    `p10` DOUBLE NULL,
    `p90` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ForecastResult_runId_date_idx`(`runId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ForecastRun` ADD CONSTRAINT `ForecastRun_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForecastRun` ADD CONSTRAINT `ForecastRun_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForecastResult` ADD CONSTRAINT `ForecastResult_runId_fkey` FOREIGN KEY (`runId`) REFERENCES `ForecastRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
