PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `group` (
  `uuid` varchar(8) NOT NULL,
  `parent` varchar(8) NOT NULL,
  PRIMARY KEY (`uuid`,`parent`),
  FOREIGN KEY (`uuid`) REFERENCES `object` (`uuid`),
  FOREIGN KEY (`parent`) REFERENCES `object` (`uuid`)
);
CREATE TABLE `link` (
  `uuid` varchar(8) NOT NULL,
  `start` varchar(8) NOT NULL,
  `end` varchar(8) NOT NULL,
  `direction` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`uuid`) REFERENCES `object` (`uuid`),
  FOREIGN KEY (`start`) REFERENCES `object` (`uuid`),
  FOREIGN KEY (`end`) REFERENCES `object` (`uuid`)
);
CREATE TABLE `object` (
  `uuid` varchar(8) NOT NULL,
  PRIMARY KEY (`uuid`)
);
CREATE TABLE `property` (
  `uuid` varchar(8) NOT NULL,
  `parent` varchar(8) NOT NULL,
  `name` text NOT NULL,
  `content` longblob NOT NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`uuid`) REFERENCES `object` (`uuid`),
  FOREIGN KEY (`parent`) REFERENCES `object` (`uuid`)
);
COMMIT;
