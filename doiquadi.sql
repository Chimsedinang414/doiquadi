-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: doiquadi
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_audit_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `actor_user_id` char(36) DEFAULT NULL,
  `action` varchar(64) NOT NULL,
  `target_type` varchar(64) NOT NULL,
  `target_id` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `idx_admin_audit_created` (`created_at`),
  KEY `idx_admin_audit_actor` (`actor_user_id`),
  CONSTRAINT `fk_admin_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
INSERT INTO `admin_audit_logs` VALUES (1,'fdade0b2-1815-4ac7-86b8-5927d9603d88','LOCATION_APPROVED','LOCATION','6cdc30dc-976f-471e-a5f9-ed9c1e862793','old=PENDING; new=VERIFIED; reason=Confirm; ip=0:0:0:0:0:0:0:1; userAgent=Mozilla/5.0 (Wi dows NT 10.0; Wi 64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Ch ome/150.0.0.0 Safa i/537.36','2026-07-31 08:17:12.000000');
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkins`
--

DROP TABLE IF EXISTS `checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `checkins` (
  `user_id` char(36) NOT NULL,
  `location_id` char(36) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`location_id`,`time`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `checkins_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkins`
--

LOCK TABLES `checkins` WRITE;
/*!40000 ALTER TABLE `checkins` DISABLE KEYS */;
/*!40000 ALTER TABLE `checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_items`
--

DROP TABLE IF EXISTS `collection_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collection_items` (
  `collection_id` char(36) NOT NULL,
  `location_id` char(36) NOT NULL,
  PRIMARY KEY (`collection_id`,`location_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `collection_items_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collection_items_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_items`
--

LOCK TABLES `collection_items` WRITE;
/*!40000 ALTER TABLE `collection_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `collection_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collections`
--

DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collections` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `collections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collections`
--

LOCK TABLES `collections` WRITE;
/*!40000 ALTER TABLE `collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL,
  `post_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `content` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `moderation_reason` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_comments_status_created` (`status`,`created_at`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES ('6a9d84c0-5a65-42d9-b3f8-66c93ae99287','3c43154f-29b5-433c-a0d5-b3713a0ac180','fdade0b2-1815-4ac7-86b8-5927d9603d88','wow','ACTIVE',NULL,'2026-07-28 17:19:35'),('7d27586f-a32e-4bec-b17f-a957598b2124','d86b3327-3896-4026-b752-d66eed126189','60c67d6c-5315-4043-bc7f-fc4289d5c86a','nice','ACTIVE',NULL,'2026-07-30 11:53:15'),('f804023a-2b74-4f0e-a176-429c8fe2c09c','f4ba6dfd-e348-4d3e-86fa-7d299223f438','60c67d6c-5315-4043-bc7f-fc4289d5c86a','hihi','ACTIVE',NULL,'2026-07-30 11:53:23');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_comments
BEFORE INSERT ON comments
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `conversation_members`
--

DROP TABLE IF EXISTS `conversation_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversation_members` (
  `conversation_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('OWNER','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `nickname` varchar(50) DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`conversation_id`,`user_id`),
  KEY `fk_conversation_members_user` (`user_id`),
  CONSTRAINT `fk_conversation_members_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversation_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_members`
--

LOCK TABLES `conversation_members` WRITE;
/*!40000 ALTER TABLE `conversation_members` DISABLE KEYS */;
INSERT INTO `conversation_members` VALUES ('0ec0f0cf-854f-4504-a5d4-ea97b27f3670','60c67d6c-5315-4043-bc7f-fc4289d5c86a','MEMBER',NULL,'2026-07-30 11:49:20','2026-07-30 11:52:38'),('0ec0f0cf-854f-4504-a5d4-ea97b27f3670','fdade0b2-1815-4ac7-86b8-5927d9603d88','MEMBER',NULL,'2026-07-30 11:49:20','2026-07-31 08:00:16'),('675cdc48-c03f-4dd2-ade8-70702af454ff','84b247e8-8b47-432f-a53d-93aa18a12494','MEMBER',NULL,'2026-07-28 18:06:07','2026-07-30 11:51:23'),('675cdc48-c03f-4dd2-ade8-70702af454ff','fdade0b2-1815-4ac7-86b8-5927d9603d88','MEMBER',NULL,'2026-07-28 18:06:07','2026-07-31 08:00:18'),('9a23d9a3-d186-4664-8752-6f5db4111d25','9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','MEMBER',NULL,'2026-07-31 08:16:08','2026-07-31 08:16:08'),('9a23d9a3-d186-4664-8752-6f5db4111d25','fdade0b2-1815-4ac7-86b8-5927d9603d88','MEMBER',NULL,'2026-07-31 08:16:08','2026-07-31 08:16:08'),('b1d33ac9-4d4c-4a0f-b212-b68875a75eab','60c67d6c-5315-4043-bc7f-fc4289d5c86a','MEMBER',NULL,'2026-07-30 11:50:37','2026-07-30 11:52:29'),('b1d33ac9-4d4c-4a0f-b212-b68875a75eab','84b247e8-8b47-432f-a53d-93aa18a12494','OWNER',NULL,'2026-07-30 11:50:37','2026-07-30 11:51:09'),('b1d33ac9-4d4c-4a0f-b212-b68875a75eab','fdade0b2-1815-4ac7-86b8-5927d9603d88','MEMBER',NULL,'2026-07-30 11:50:37','2026-07-31 08:00:15');
/*!40000 ALTER TABLE `conversation_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversations` (
  `id` char(36) NOT NULL,
  `type` enum('DIRECT','GROUP') NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `creator_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_conversations_creator` (`creator_id`),
  CONSTRAINT `fk_conversations_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('0ec0f0cf-854f-4504-a5d4-ea97b27f3670','DIRECT',NULL,NULL,'60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-30 11:49:20','2026-07-30 11:49:33'),('675cdc48-c03f-4dd2-ade8-70702af454ff','DIRECT',NULL,NULL,'84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-28 18:06:07','2026-07-28 18:06:34'),('9a23d9a3-d186-4664-8752-6f5db4111d25','DIRECT',NULL,NULL,'fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-31 08:16:08','2026-07-31 08:16:08'),('b1d33ac9-4d4c-4a0f-b212-b68875a75eab','GROUP','Oke con dê',NULL,'84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-30 11:50:37','2026-07-30 11:52:36');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `user_id` char(36) NOT NULL,
  `location_id` char(36) NOT NULL,
  PRIMARY KEY (`user_id`,`location_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES ('fdade0b2-1815-4ac7-86b8-5927d9603d88','6cdc30dc-976f-471e-a5f9-ed9c1e862793');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `follows` (
  `follower_id` char(36) NOT NULL,
  `following_id` char(36) NOT NULL,
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `following_id` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`follower_id` <> `following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
INSERT INTO `follows` VALUES ('60c67d6c-5315-4043-bc7f-fc4289d5c86a','84b247e8-8b47-432f-a53d-93aa18a12494'),('60c67d6c-5315-4043-bc7f-fc4289d5c86a','fdade0b2-1815-4ac7-86b8-5927d9603d88'),('84b247e8-8b47-432f-a53d-93aa18a12494','60c67d6c-5315-4043-bc7f-fc4289d5c86a'),('84b247e8-8b47-432f-a53d-93aa18a12494','fdade0b2-1815-4ac7-86b8-5927d9603d88'),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','84b247e8-8b47-432f-a53d-93aa18a12494'),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','fdade0b2-1815-4ac7-86b8-5927d9603d88'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','60c67d6c-5315-4043-bc7f-fc4289d5c86a'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','84b247e8-8b47-432f-a53d-93aa18a12494'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4');
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foods`
--

DROP TABLE IF EXISTS `foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `foods` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `moderation_reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_foods_status_name` (`status`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foods`
--

LOCK TABLES `foods` WRITE;
/*!40000 ALTER TABLE `foods` DISABLE KEYS */;
/*!40000 ALTER TABLE `foods` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_foods
BEFORE INSERT ON foods
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `likes` (
  `user_id` char(36) NOT NULL,
  `post_id` char(36) NOT NULL,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES ('60c67d6c-5315-4043-bc7f-fc4289d5c86a','3c43154f-29b5-433c-a0d5-b3713a0ac180'),('60c67d6c-5315-4043-bc7f-fc4289d5c86a','d86b3327-3896-4026-b752-d66eed126189'),('60c67d6c-5315-4043-bc7f-fc4289d5c86a','f4ba6dfd-e348-4d3e-86fa-7d299223f438'),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','3c43154f-29b5-433c-a0d5-b3713a0ac180'),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','d86b3327-3896-4026-b752-d66eed126189'),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','f4ba6dfd-e348-4d3e-86fa-7d299223f438'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','3c43154f-29b5-433c-a0d5-b3713a0ac180'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','d86b3327-3896-4026-b752-d66eed126189'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','f4ba6dfd-e348-4d3e-86fa-7d299223f438');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_foods`
--

DROP TABLE IF EXISTS `location_foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location_foods` (
  `location_id` char(36) NOT NULL,
  `food_id` char(36) NOT NULL,
  PRIMARY KEY (`location_id`,`food_id`),
  KEY `food_id` (`food_id`),
  CONSTRAINT `location_foods_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `location_foods_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_foods`
--

LOCK TABLES `location_foods` WRITE;
/*!40000 ALTER TABLE `location_foods` DISABLE KEYS */;
/*!40000 ALTER TABLE `location_foods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_images`
--

DROP TABLE IF EXISTS `location_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location_images` (
  `id` varchar(36) NOT NULL,
  `location_id` char(36) NOT NULL,
  `storage_key` varchar(1024) DEFAULT NULL,
  `image_url` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `location_images_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_images`
--

LOCK TABLES `location_images` WRITE;
/*!40000 ALTER TABLE `location_images` DISABLE KEYS */;
INSERT INTO `location_images` VALUES ('0f41ba57-2a7c-456d-b5db-4fbc2edb4b25','6cdc30dc-976f-471e-a5f9-ed9c1e862793','users/9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4/images/a1d7d451-1888-4e4d-afa2-846a525f544d.jpg','https://my-web-strorage-7-2026-384351445017-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/users/9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4/images/a1d7d451-1888-4e4d-afa2-846a525f544d.jpg');
/*!40000 ALTER TABLE `location_images` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_location_images
BEFORE INSERT ON location_images
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avg_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `moderation_reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_locations_status_name` (`status`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES ('6cdc30dc-976f-471e-a5f9-ed9c1e862793','Lẩu Nướng GOGI (GOGI HOUSE)','T3, TTTM AEONMALL , 46 Điện Biên Phủ',0,NULL,NULL,NULL,'0953245324',100000.00,'VERIFIED','Confirm');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_locations
BEFORE INSERT ON locations
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` char(36) NOT NULL,
  `sender_id` char(36) NOT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(1000) DEFAULT NULL,
  `type` enum('TEXT','IMAGE','SYSTEM') NOT NULL DEFAULT 'TEXT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation_time` (`conversation_id`,`created_at`),
  KEY `fk_messages_sender` (`sender_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('7b130a91-9f0b-4241-a4c8-66a2bb846af6','0ec0f0cf-854f-4504-a5d4-ea97b27f3670','60c67d6c-5315-4043-bc7f-fc4289d5c86a','What are you doing',NULL,'TEXT','2026-07-30 11:49:33'),('7dd849fd-1c24-4ca7-a22c-390879408358','675cdc48-c03f-4dd2-ade8-70702af454ff','fdade0b2-1815-4ac7-86b8-5927d9603d88','What are u ??',NULL,'TEXT','2026-07-28 18:06:34'),('7ef21fcd-a9ab-48e8-bc3e-df26d4005bf6','675cdc48-c03f-4dd2-ade8-70702af454ff','84b247e8-8b47-432f-a53d-93aa18a12494','Hi',NULL,'TEXT','2026-07-28 18:06:12'),('821d1494-daf9-4b7f-a235-7fc2016a5642','b1d33ac9-4d4c-4a0f-b212-b68875a75eab','84b247e8-8b47-432f-a53d-93aa18a12494','anh-bun đã tạo nhóm',NULL,'SYSTEM','2026-07-30 11:50:37'),('83fbd4d6-a055-4771-9a0f-466743757f7e','0ec0f0cf-854f-4504-a5d4-ea97b27f3670','60c67d6c-5315-4043-bc7f-fc4289d5c86a','Cuộc trò chuyện đã được tạo',NULL,'SYSTEM','2026-07-30 11:49:20'),('88c55d83-142f-46da-af17-2b2830e9d501','0ec0f0cf-854f-4504-a5d4-ea97b27f3670','60c67d6c-5315-4043-bc7f-fc4289d5c86a','Hi leo',NULL,'TEXT','2026-07-30 11:49:25'),('96ebb058-a4fb-461a-89cc-2470d688c096','b1d33ac9-4d4c-4a0f-b212-b68875a75eab','84b247e8-8b47-432f-a53d-93aa18a12494','anh-bun đã đổi tên nhóm thành \"Oke con dê\"',NULL,'SYSTEM','2026-07-30 11:51:06'),('a2b5993a-a2f8-4298-bf84-9af2a0b8ebd0','b1d33ac9-4d4c-4a0f-b212-b68875a75eab','60c67d6c-5315-4043-bc7f-fc4289d5c86a','hi',NULL,'TEXT','2026-07-30 11:52:36'),('b2e4fdc6-5d60-48fe-95c0-b7f638e03165','b1d33ac9-4d4c-4a0f-b212-b68875a75eab','84b247e8-8b47-432f-a53d-93aa18a12494','anh-bun đã đổi tên nhóm thành \"Quan\"',NULL,'SYSTEM','2026-07-30 11:50:42'),('ca734244-d1a3-48b6-b913-176ec468f075','675cdc48-c03f-4dd2-ade8-70702af454ff','84b247e8-8b47-432f-a53d-93aa18a12494','Cuộc trò chuyện đã được tạo',NULL,'SYSTEM','2026-07-28 18:06:07'),('ce028cf5-6988-449d-8fc7-e03e53dd2be2','9a23d9a3-d186-4664-8752-6f5db4111d25','fdade0b2-1815-4ac7-86b8-5927d9603d88','Cuộc trò chuyện đã được tạo',NULL,'SYSTEM','2026-07-31 08:16:08');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `receiver_id` char(36) NOT NULL,
  `type` enum('LIKE_POST','COMMENT','FOLLOW','CHECKIN') NOT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('1e559762-924b-40e5-8a7c-a3f54dda93ba','fdade0b2-1815-4ac7-86b8-5927d9603d88','LIKE_POST','f4ba6dfd-e348-4d3e-86fa-7d299223f438',0,'2026-07-31 08:23:41'),('22bcea52-b250-4e36-9001-6f33ce6bd93a','84b247e8-8b47-432f-a53d-93aa18a12494','LIKE_POST','3c43154f-29b5-433c-a0d5-b3713a0ac180',0,'2026-07-30 11:48:20'),('295d5a8f-82fd-4c92-b82a-255873a23158','84b247e8-8b47-432f-a53d-93aa18a12494','LIKE_POST','3c43154f-29b5-433c-a0d5-b3713a0ac180',1,'2026-07-28 17:19:27'),('2b09949d-184a-48ec-a616-e32c37acf27a','84b247e8-8b47-432f-a53d-93aa18a12494','FOLLOW','9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4',0,'2026-07-31 08:05:38'),('46191948-2059-4e14-85be-4640eb74f65d','fdade0b2-1815-4ac7-86b8-5927d9603d88','FOLLOW','60c67d6c-5315-4043-bc7f-fc4289d5c86a',1,'2026-07-29 05:38:08'),('59f9f0f5-c066-4117-b282-1aac9dacaa73','fdade0b2-1815-4ac7-86b8-5927d9603d88','FOLLOW','84b247e8-8b47-432f-a53d-93aa18a12494',1,'2026-07-28 18:05:16'),('60a2d21c-2f28-4cd6-919b-403034ab2851','fdade0b2-1815-4ac7-86b8-5927d9603d88','LIKE_POST','d86b3327-3896-4026-b752-d66eed126189',0,'2026-07-30 11:48:07'),('7fc7b450-3635-4a0b-9804-333bd654bf0b','fdade0b2-1815-4ac7-86b8-5927d9603d88','LIKE_POST','d86b3327-3896-4026-b752-d66eed126189',0,'2026-07-31 08:23:39'),('89f8c666-d789-4c34-bbce-1f4a9e7d0de9','fdade0b2-1815-4ac7-86b8-5927d9603d88','LIKE_POST','f4ba6dfd-e348-4d3e-86fa-7d299223f438',0,'2026-07-30 11:48:15'),('8fbde8ab-657c-4d22-8ea0-5c53e7a880df','fdade0b2-1815-4ac7-86b8-5927d9603d88','FOLLOW','84b247e8-8b47-432f-a53d-93aa18a12494',0,'2026-07-30 11:49:58'),('9041176d-b418-420c-95ec-25d32a9f95a5','84b247e8-8b47-432f-a53d-93aa18a12494','LIKE_POST','3c43154f-29b5-433c-a0d5-b3713a0ac180',0,'2026-07-31 08:23:44'),('995a8f5e-fcf9-46cc-ba49-0dbd9521a8bd','fdade0b2-1815-4ac7-86b8-5927d9603d88','LIKE_POST','d86b3327-3896-4026-b752-d66eed126189',0,'2026-07-30 11:53:10'),('ae68b82c-961f-4c36-8818-3ec65e206e28','84b247e8-8b47-432f-a53d-93aa18a12494','FOLLOW','60c67d6c-5315-4043-bc7f-fc4289d5c86a',1,'2026-07-28 17:58:12'),('ae700e8d-d0d3-482c-93a7-2d0303a0bdba','84b247e8-8b47-432f-a53d-93aa18a12494','LIKE_POST','3c43154f-29b5-433c-a0d5-b3713a0ac180',0,'2026-07-30 11:47:19'),('b11b7722-7766-4717-8947-c9eac3972a62','60c67d6c-5315-4043-bc7f-fc4289d5c86a','FOLLOW','fdade0b2-1815-4ac7-86b8-5927d9603d88',1,'2026-07-29 13:34:45'),('bd4aebd1-2905-4dc8-a0c2-37eb54939dd3','fdade0b2-1815-4ac7-86b8-5927d9603d88','COMMENT','f4ba6dfd-e348-4d3e-86fa-7d299223f438',0,'2026-07-30 11:53:23'),('c259e5ae-7b77-4f20-a1ab-d668c7d12b95','fdade0b2-1815-4ac7-86b8-5927d9603d88','LIKE_POST','d86b3327-3896-4026-b752-d66eed126189',0,'2026-07-30 11:48:25'),('cc5be62e-2f9c-48a6-99f8-e07bd27ee9e5','84b247e8-8b47-432f-a53d-93aa18a12494','COMMENT','3c43154f-29b5-433c-a0d5-b3713a0ac180',1,'2026-07-28 17:19:35'),('d06c7c71-000e-4053-b5eb-809ed877c3f2','84b247e8-8b47-432f-a53d-93aa18a12494','LIKE_POST','3c43154f-29b5-433c-a0d5-b3713a0ac180',0,'2026-07-30 11:48:17'),('db797dff-3046-4368-a70d-1601b431118d','84b247e8-8b47-432f-a53d-93aa18a12494','FOLLOW','fdade0b2-1815-4ac7-86b8-5927d9603d88',1,'2026-07-28 17:56:54'),('e325e729-303a-4134-b5fa-3d19ca3d0688','60c67d6c-5315-4043-bc7f-fc4289d5c86a','FOLLOW','84b247e8-8b47-432f-a53d-93aa18a12494',1,'2026-07-30 11:49:49'),('e786e2b7-48de-4b35-aadf-b9e018b01dd2','9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','FOLLOW','fdade0b2-1815-4ac7-86b8-5927d9603d88',1,'2026-07-31 08:15:51'),('f10b80e5-5ca9-4f84-a45c-aaab7a9d1650','fdade0b2-1815-4ac7-86b8-5927d9603d88','FOLLOW','9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4',0,'2026-07-31 08:05:37'),('f89d681a-2949-4757-8552-91c25bb22767','fdade0b2-1815-4ac7-86b8-5927d9603d88','COMMENT','d86b3327-3896-4026-b752-d66eed126189',0,'2026-07-30 11:53:15');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_notifications
BEFORE INSERT ON notifications
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `oauth_accounts`
--

DROP TABLE IF EXISTS `oauth_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_accounts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `provider` varchar(32) NOT NULL,
  `provider_subject` varchar(255) NOT NULL,
  `email_at_provider` varchar(254) DEFAULT NULL,
  `user_id` char(36) NOT NULL,
  `linked_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_oauth_provider_subject` (`provider`,`provider_subject`),
  UNIQUE KEY `uk_oauth_user_provider` (`user_id`,`provider`),
  CONSTRAINT `oauth_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_accounts`
--

LOCK TABLES `oauth_accounts` WRITE;
/*!40000 ALTER TABLE `oauth_accounts` DISABLE KEYS */;
INSERT INTO `oauth_accounts` VALUES (1,'GOOGLE','111821714751645773586','bunanh404@gmail.com','84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-28 16:47:24.000000'),(2,'GOOGLE','112900894189281357575','nanhquan831@gmail.com','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-28 17:18:48.000000'),(3,'FACEBOOK','1737836234229940','204anhquan@gmail.com','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-28 17:58:03.000000');
/*!40000 ALTER TABLE `oauth_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_link_intents`
--

DROP TABLE IF EXISTS `oauth_link_intents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_link_intents` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `token_hash` varchar(64) NOT NULL,
  `user_id` char(36) NOT NULL,
  `provider` varchar(32) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `consumed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_oauth_link_intent_expiry` (`expires_at`),
  KEY `fk_oauth_link_intent_user` (`user_id`),
  CONSTRAINT `fk_oauth_link_intent_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_link_intents`
--

LOCK TABLES `oauth_link_intents` WRITE;
/*!40000 ALTER TABLE `oauth_link_intents` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_link_intents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_login_codes`
--

DROP TABLE IF EXISTS `oauth_login_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_login_codes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code_hash` varchar(64) NOT NULL,
  `user_id` char(36) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `consumed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_hash` (`code_hash`),
  KEY `idx_oauth_login_code_expiry` (`expires_at`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_login_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_login_codes`
--

LOCK TABLES `oauth_login_codes` WRITE;
/*!40000 ALTER TABLE `oauth_login_codes` DISABLE KEYS */;
INSERT INTO `oauth_login_codes` VALUES (1,'78995b7b13743f41c92d1521e3f5346d5a921f1282d85f0d1c3ef1beb8b1ee61','84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-28 16:48:24.000000','2026-07-28 16:47:25.000000'),(2,'21a82e822936899c0e34d31df974ab73ec68716e52627235f6232ac4fcbd062c','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-28 17:19:48.000000','2026-07-28 17:18:48.000000'),(3,'9967b26a0a1170e65a51ddb8fbb6fe2efd6e7e5f2b64e66b413a5419a595fb0f','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-28 17:22:30.000000','2026-07-28 17:21:31.000000'),(4,'3db6309e705df244f1af28daeb30509dbf5fb22747a7125cc8cc6ed81f4ff859','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-28 17:26:38.000000','2026-07-28 17:25:39.000000'),(5,'261ec100aef4423225ca03709d16ba8cbe6dd85087def492bd9b20828862fcd1','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-28 17:59:04.000000','2026-07-28 17:58:04.000000'),(6,'76a5a49286d97709a9024e72905762d62007bd05d35f70982e0d1e982f7c3906','84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-28 18:00:55.000000','2026-07-28 17:59:55.000000'),(7,'c9dc424ca172e6dd06f06baaab03767762810da4ada165e0a61b69f7b9acfcb8','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-28 18:03:16.000000','2026-07-28 18:02:16.000000'),(8,'4a2a00ca486922dae16477a73459d3a085263194c26e4082f1e4fb04987b14d3','84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-28 18:06:06.000000','2026-07-28 18:05:06.000000'),(9,'f9823247da8e191733b20558371880e690225baa32ca3abcf2b393fea2e76610','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-28 18:07:20.000000','2026-07-28 18:06:21.000000'),(10,'45c3f649b9fa0aafca19c67841eef519f27c8d8ec82b5a26e8b5b6b4c7eab954','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-29 05:39:04.000000','2026-07-29 05:38:05.000000'),(11,'186162667fca800d728b7969ff96dba0db46d6cb4638320ac3b6b8472d4d9151','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-29 05:57:53.000000','2026-07-29 05:56:54.000000'),(12,'8250e3b9b4b524f804f9504a910f05487749e57c78099f7f507088bbd48d1c4c','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-29 06:12:48.000000','2026-07-29 06:11:48.000000'),(13,'ba4f5395ba89de27d59bcd5c9f4f3720827692a8e3857d5f13cc3950097f8496','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-29 13:14:18.000000','2026-07-29 13:13:21.000000'),(14,'1c1f89415221c6572583806bcd7e27da7f882121c326e836efe5a250110a5c53','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-29 13:27:32.000000','2026-07-29 13:26:33.000000'),(15,'be1ca230b62c0d8bb50f1c9c683c7dc5797a106b5ae17f78ef337f934fd66469','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-29 13:34:50.000000','2026-07-29 13:33:50.000000'),(16,'6d5525f0cc5662d96acc00d4f25e9968fe862699eb7d5e3cbf211924536fcf4f','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-30 08:51:52.000000','2026-07-30 08:50:53.000000'),(17,'bfc2f900854a7ab1ded21addaace1a3d57f784c64788de91a954f6d5ff416118','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-30 10:52:35.000000','2026-07-30 10:51:36.000000'),(18,'ae1ce3b766f893905d5391a631cc061055ec0ac257d303fa902bdf4a69ecdf03','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-30 11:15:26.000000','2026-07-30 11:14:27.000000'),(19,'4f8ac3b8ea8cb0d19b2e8059b3a9795ec959267bdef9856db9450eb875435a18','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-30 11:44:57.000000','2026-07-30 11:43:57.000000'),(20,'6844370d70da72898dfdca7de050bd1cec51dc800ba6dbcb0d467543e7659a0c','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-30 11:49:01.000000','2026-07-30 11:48:02.000000'),(21,'42ccf8fc520c9a06c6309e2819f88f2bde0660e0f4d0454a1d25c4c631b439b3','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-30 11:49:40.000000','2026-07-30 11:48:40.000000'),(22,'b68e3e7b17d2491e3d1a8db884561f3b3fdf733f027e7daa991e53b09a87816d','84b247e8-8b47-432f-a53d-93aa18a12494','2026-07-30 11:50:41.000000','2026-07-30 11:49:41.000000'),(23,'a186eed8caf2befd150a9d50bfc87c56504eb7182bddd7e294b2c45b37af878a','60c67d6c-5315-4043-bc7f-fc4289d5c86a','2026-07-30 11:52:53.000000','2026-07-30 11:51:54.000000'),(24,'aba3b56e7ddbceeeaa3f50dc3858221d1b90124356674faecfed266bee449981','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-30 11:55:26.000000','2026-07-30 11:54:26.000000'),(25,'114e2bdcdb4a4a9a96a6750175e43b18fe47a92671f75a5e379924b0e9bc5654','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-31 08:00:52.000000','2026-07-31 07:59:53.000000'),(26,'bea8c26e2c5d3de42e20cce834f32caec8cc555ceb7c6a49b634ea7d25d49c06','fdade0b2-1815-4ac7-86b8-5927d9603d88','2026-07-31 08:16:36.000000','2026-07-31 08:15:36.000000');
/*!40000 ALTER TABLE `oauth_login_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `token_hash` varchar(64) NOT NULL,
  `user_id` char(36) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `consumed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_password_reset_expiry` (`expires_at`),
  KEY `idx_password_reset_user_created` (`user_id`,`created_at`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_images`
--

DROP TABLE IF EXISTS `post_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_images` (
  `id` varchar(36) NOT NULL,
  `post_id` char(36) NOT NULL,
  `storage_key` varchar(1024) DEFAULT NULL,
  `image_url` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_images_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_images`
--

LOCK TABLES `post_images` WRITE;
/*!40000 ALTER TABLE `post_images` DISABLE KEYS */;
INSERT INTO `post_images` VALUES ('a528e59d-50bf-44d7-bb94-e8397f0958c0','d86b3327-3896-4026-b752-d66eed126189','users/fdade0b2-1815-4ac7-86b8-5927d9603d88/images/989f2651-2c40-43c9-92b0-9423602db056.png','https://my-web-strorage-7-2026-384351445017-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/users/fdade0b2-1815-4ac7-86b8-5927d9603d88/images/989f2651-2c40-43c9-92b0-9423602db056.png');
/*!40000 ALTER TABLE `post_images` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_post_images
BEFORE INSERT ON post_images
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_tags` (
  `post_id` char(36) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
INSERT INTO `post_tags` VALUES ('d86b3327-3896-4026-b752-d66eed126189',2),('d86b3327-3896-4026-b752-d66eed126189',3),('f4ba6dfd-e348-4d3e-86fa-7d299223f438',1);
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `location_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `rating` float DEFAULT NULL CHECK (`rating` >= 0 and `rating` <= 5),
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `moderation_reason` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `location_id` (`location_id`),
  KEY `idx_posts_status_created` (`status`,`created_at`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES ('3c43154f-29b5-433c-a0d5-b3713a0ac180','84b247e8-8b47-432f-a53d-93aa18a12494',NULL,'Ngon',NULL,NULL,'ACTIVE',NULL,'2026-07-28 16:48:16'),('d86b3327-3896-4026-b752-d66eed126189','fdade0b2-1815-4ac7-86b8-5927d9603d88',NULL,'Đáng để thử','Haha trải nghiệm đáng nhớ cùng gia đình',4,'ACTIVE',NULL,'2026-07-30 11:27:29'),('f4ba6dfd-e348-4d3e-86fa-7d299223f438','fdade0b2-1815-4ac7-86b8-5927d9603d88',NULL,'Quán ngon ở Huế','Trưa này mình có chuyến cùng gia đình đi cung thành huế chơi thì có duyên bắt gặp quán này , đồ ăn ngon mà giá cả rẻ nữa',5,'ACTIVE',NULL,'2026-07-28 18:04:39');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_posts
BEFORE INSERT ON posts
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reports` (
  `id` varchar(36) NOT NULL,
  `reporter_id` varchar(36) NOT NULL,
  `target_type` varchar(30) NOT NULL,
  `target_id` varchar(64) NOT NULL,
  `reason` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `assigned_admin_id` varchar(36) DEFAULT NULL,
  `resolution_note` text DEFAULT NULL,
  `resolution_action` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `resolved_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reports_queue` (`status`,`created_at`),
  KEY `idx_reports_target` (`target_type`,`target_id`),
  KEY `idx_reports_reporter` (`reporter_id`,`status`),
  KEY `fk_reports_admin` (`assigned_admin_id`),
  CONSTRAINT `fk_reports_admin` FOREIGN KEY (`assigned_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'comtruahue'),(2,'matrix'),(3,'SleepDisorder');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `user_id` char(36) NOT NULL,
  `role` varchar(32) NOT NULL,
  PRIMARY KEY (`user_id`,`role`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('60c67d6c-5315-4043-bc7f-fc4289d5c86a','USER'),('84b247e8-8b47-432f-a53d-93aa18a12494','USER'),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','USER'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','ADMIN'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','SUPER_ADMIN'),('fdade0b2-1815-4ac7-86b8-5927d9603d88','USER');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_violations`
--

DROP TABLE IF EXISTS `user_violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_violations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `admin_id` varchar(36) NOT NULL,
  `action` varchar(20) NOT NULL,
  `reason` varchar(500) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `idx_user_violations_user_created` (`user_id`,`created_at`),
  KEY `fk_user_violations_admin` (`admin_id`),
  CONSTRAINT `fk_user_violations_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_user_violations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_violations`
--

LOCK TABLES `user_violations` WRITE;
/*!40000 ALTER TABLE `user_violations` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_violations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `auth_subject` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `account_status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `suspended_until` datetime(6) DEFAULT NULL,
  `moderation_reason` varchar(500) DEFAULT NULL,
  `warning_count` int(11) NOT NULL DEFAULT 0,
  `credentials_version` int(11) NOT NULL DEFAULT 0,
  `avatar_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_subject` (`auth_subject`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('60c67d6c-5315-4043-bc7f-fc4289d5c86a','a5514ca7-24a7-4efc-bbc3-11eefd885287','minh-kh-i','204anhquan@gmail.com',NULL,1,'ACTIVE',NULL,NULL,0,0,'','Chàng trai thích ăn','2026-07-28 17:58:03','Hồ Chí Minh','2000-02-24','Minh Khôi','0975683680'),('84b247e8-8b47-432f-a53d-93aa18a12494','6d778284-95c6-4e37-8091-797d517a72a3','anh-bun','bunanh404@gmail.com',NULL,1,'ACTIVE',NULL,NULL,0,0,'https://lh3.googleusercontent.com/a/ACg8ocIHHWz9KL8kBHV-KBny5lobnMYzfuHtR5xkGs9HBAO6zk1wkNQ=s96-c',NULL,'2026-07-28 16:47:24',NULL,NULL,NULL,NULL),('9bf55f18-83f5-4bf6-b93e-fbb9eb8bcdd4','1019f5e0-cab3-41fd-83ed-2c93d63cf1ae','Bích_Hà','bichha205@gmail.com','$2a$12$fa2kLm48H9SrIZBoc8yNg.fBN1pQzdH5hSKw9TWDS8AjOPxgW9OOa',1,'ACTIVE',NULL,NULL,0,0,'','','2026-07-31 08:02:46','Đà Nẵng ,Việt Nam','2005-07-14','Hà anie',''),('fdade0b2-1815-4ac7-86b8-5927d9603d88','ff01ca21-aa76-4bb8-9055-894d31e650eb','anh-qu-n-nguy-n','nanhquan831@gmail.com',NULL,1,'ACTIVE',NULL,NULL,0,1,'https://lh3.googleusercontent.com/a/ACg8ocIzQrGltSTK0SBSl7-_i87HBBlgfvhAhavMSqQtB6Gnwb-qEIpu=s96-c','','2026-07-28 17:18:48','Đà Nẵng ,Việt Nam','2004-04-01','Quan','0798922674');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()),
    NEW.auth_subject = COALESCE(NULLIF(NEW.auth_subject, ''), UUID()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'doiquadi'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-31 16:02:29
