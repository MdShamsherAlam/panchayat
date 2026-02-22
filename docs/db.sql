-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Feb 22, 2026 at 05:44 PM
-- Server version: 9.3.0
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `panchayat`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` int NOT NULL,
  `url` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `fileType` varchar(255) NOT NULL,
  `complaintId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int NOT NULL,
  `trackingId` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `geoTag` json DEFAULT NULL,
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `wardNo` varchar(255) NOT NULL,
  `citizenId` int DEFAULT NULL,
  `officialId` int DEFAULT NULL,
  `slaDeadline` datetime NOT NULL,
  `isEscalated` tinyint(1) DEFAULT '0',
  `escalatedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `assignedStaff` varchar(255) DEFAULT NULL COMMENT 'Name/contact of field worker assigned to this complaint',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int NOT NULL,
  `event` varchar(255) NOT NULL,
  `comment` text,
  `previousStatus` varchar(255) DEFAULT NULL,
  `newStatus` varchar(255) DEFAULT NULL,
  `complaintId` int DEFAULT NULL,
  `performedById` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES
(1, 'Administrator', 'admin', '2026-02-22 15:36:40', '2026-02-22 15:36:40'),
(2, 'Panchayat Official', 'official', '2026-02-22 15:36:41', '2026-02-22 15:36:41'),
(3, 'Citizen', 'citizen', '2026-02-22 15:36:41', '2026-02-22 15:36:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `wardNo` varchar(255) DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `wardNo`, `roleId`, `createdAt`, `updatedAt`) VALUES 
(NULL, 'admin', 'admin@panchayat.gov.in', '$2a$10$.x99mhQTZL.bRruCPBeau.Ko0u6iSRySzOj4ePZkBihWJv33aGs7S', NULL, '1', '2026-02-22 15:36:41', '2026-02-22 16:59:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaintId` (`complaintId`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trackingId` (`trackingId`),
  ADD UNIQUE KEY `trackingId_2` (`trackingId`),
  ADD UNIQUE KEY `trackingId_3` (`trackingId`),
  ADD UNIQUE KEY `trackingId_4` (`trackingId`),
  ADD UNIQUE KEY `trackingId_5` (`trackingId`),
  ADD UNIQUE KEY `trackingId_6` (`trackingId`),
  ADD UNIQUE KEY `trackingId_7` (`trackingId`),
  ADD UNIQUE KEY `trackingId_8` (`trackingId`),
  ADD UNIQUE KEY `trackingId_9` (`trackingId`),
  ADD UNIQUE KEY `trackingId_10` (`trackingId`),
  ADD UNIQUE KEY `trackingId_11` (`trackingId`),
  ADD UNIQUE KEY `trackingId_12` (`trackingId`),
  ADD UNIQUE KEY `trackingId_13` (`trackingId`),
  ADD UNIQUE KEY `trackingId_14` (`trackingId`),
  ADD UNIQUE KEY `trackingId_15` (`trackingId`),
  ADD UNIQUE KEY `trackingId_16` (`trackingId`),
  ADD UNIQUE KEY `trackingId_17` (`trackingId`),
  ADD UNIQUE KEY `trackingId_18` (`trackingId`),
  ADD UNIQUE KEY `trackingId_19` (`trackingId`),
  ADD UNIQUE KEY `trackingId_20` (`trackingId`),
  ADD UNIQUE KEY `trackingId_21` (`trackingId`),
  ADD UNIQUE KEY `trackingId_22` (`trackingId`),
  ADD UNIQUE KEY `trackingId_23` (`trackingId`),
  ADD KEY `citizenId` (`citizenId`),
  ADD KEY `officialId` (`officialId`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaintId` (`complaintId`),
  ADD KEY `performedById` (`performedById`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `slug_2` (`slug`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `slug_3` (`slug`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `slug_4` (`slug`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `slug_5` (`slug`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `slug_6` (`slug`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `slug_7` (`slug`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `slug_8` (`slug`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `slug_9` (`slug`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `slug_10` (`slug`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `slug_11` (`slug`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `slug_12` (`slug`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `slug_13` (`slug`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `slug_14` (`slug`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `slug_15` (`slug`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `slug_16` (`slug`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `slug_17` (`slug`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `slug_18` (`slug`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `slug_19` (`slug`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `slug_20` (`slug`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `slug_21` (`slug`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `slug_22` (`slug`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `slug_23` (`slug`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD KEY `roleId` (`roleId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`complaintId`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`citizenId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`officialId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_45` FOREIGN KEY (`complaintId`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `history_ibfk_46` FOREIGN KEY (`performedById`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
