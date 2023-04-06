CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `pic` varchar(500) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  `is_admin` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `is_group_chat` tinyint DEFAULT '0',
  `latest_message_id` int DEFAULT NULL,
  `admin_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_channel_user_id_idx` (`admin_id`),
  CONSTRAINT `fk_channel_user_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `channel_user` (
  `channel_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`channel_id`,`user_id`),
  KEY `fk_channel_user_user_id_idx` (`user_id`),
  CONSTRAINT `fk_channel_user_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_channel_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(1000) COLLATE utf8mb3_unicode_ci NOT NULL,
  `sender_id` int DEFAULT NULL,
  `channel_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_message_sender_id_idx` (`sender_id`),
  KEY `fk_message_channel_id_idx` (`channel_id`),
  CONSTRAINT `fk_message_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_message_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
