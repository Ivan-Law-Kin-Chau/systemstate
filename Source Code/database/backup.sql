PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `group` (
  `uuid` varchar(8) NOT NULL,
  `parent` varchar(8) NOT NULL,
  PRIMARY KEY (`uuid`,`parent`),
  FOREIGN KEY (`uuid`) REFERENCES `object` (`uuid`),
  FOREIGN KEY (`parent`) REFERENCES `object` (`uuid`)
);
INSERT INTO "group" VALUES('823VdnlZ','x5JcrI3y');
INSERT INTO "group" VALUES('bXUvnZ2L','s9K01lTL');
INSERT INTO "group" VALUES('DFqjkPES','bXUvnZ2L');
INSERT INTO "group" VALUES('fzYkA7sH','x5JcrI3y');
INSERT INTO "group" VALUES('x5JcrI3y','s9K01lTL');
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
INSERT INTO link VALUES('2WJmK4aP','x5JcrI3y','s9K01lTL',1);
INSERT INTO link VALUES('7VH7Zh7h','fzYkA7sH','DFqjkPES',1);
INSERT INTO link VALUES('gqJ8eqKU','x5JcrI3y','bXUvnZ2L',1);
INSERT INTO link VALUES('k6TOT4uK','fzYkA7sH','823VdnlZ',NULL);
INSERT INTO link VALUES('zPKMwk4A','DFqjkPES','823VdnlZ',1);
CREATE TABLE `object` (
  `uuid` varchar(8) NOT NULL,
  PRIMARY KEY (`uuid`)
);
INSERT INTO object VALUES('0ngJGgy3');
INSERT INTO object VALUES('26SjZphD');
INSERT INTO object VALUES('2WJmK4aP');
INSERT INTO object VALUES('32UjISl8');
INSERT INTO object VALUES('5aieFTV9');
INSERT INTO object VALUES('71idkiQT');
INSERT INTO object VALUES('7VH7Zh7h');
INSERT INTO object VALUES('823VdnlZ');
INSERT INTO object VALUES('bLrkndhu');
INSERT INTO object VALUES('BOdSWC7w');
INSERT INTO object VALUES('bXUvnZ2L');
INSERT INTO object VALUES('DFqjkPES');
INSERT INTO object VALUES('DNNp3jMI');
INSERT INTO object VALUES('DZ2dfVmQ');
INSERT INTO object VALUES('FX8LUzm0');
INSERT INTO object VALUES('fzYkA7sH');
INSERT INTO object VALUES('gqJ8eqKU');
INSERT INTO object VALUES('hHrDJ6HE');
INSERT INTO object VALUES('IFZ3EHMX');
INSERT INTO object VALUES('iuaVJjRD');
INSERT INTO object VALUES('k6TOT4uK');
INSERT INTO object VALUES('lC3oYvQj');
INSERT INTO object VALUES('lGFxfblC');
INSERT INTO object VALUES('nM0u0j92');
INSERT INTO object VALUES('pUc5pR7t');
INSERT INTO object VALUES('qKVH0lSm');
INSERT INTO object VALUES('S23IuQHV');
INSERT INTO object VALUES('s9K01lTL');
INSERT INTO object VALUES('Ugq4VWXq');
INSERT INTO object VALUES('VSeg1rJy');
INSERT INTO object VALUES('x5JcrI3y');
INSERT INTO object VALUES('XjTbwo4l');
INSERT INTO object VALUES('ZEwGlJWR');
INSERT INTO object VALUES('ZlfZxe2Z');
INSERT INTO object VALUES('zPKMwk4A');
CREATE TABLE `property` (
  `uuid` varchar(8) NOT NULL,
  `parent` varchar(8) NOT NULL,
  `name` text NOT NULL,
  `content` longblob NOT NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`uuid`) REFERENCES `object` (`uuid`),
  FOREIGN KEY (`parent`) REFERENCES `object` (`uuid`)
);
INSERT INTO property VALUES('iuaVJjRD','fzYkA7sH','latest project','systemstate editor');
INSERT INTO property VALUES('lC3oYvQj','DFqjkPES','color','brown');
INSERT INTO property VALUES('lGFxfblC','DFqjkPES','age','5 years old');
INSERT INTO property VALUES('nM0u0j92','bXUvnZ2L','name','dog');
INSERT INTO property VALUES('pUc5pR7t','s9K01lTL','name','living things');
INSERT INTO property VALUES('qKVH0lSm','7VH7Zh7h','name','ownership');
INSERT INTO property VALUES('S23IuQHV','DFqjkPES','favourite quote','"Woof!"');
INSERT INTO property VALUES('0ngJGgy3','fzYkA7sH','name','keith');
INSERT INTO property VALUES('26SjZphD','s9K01lTL','manifesto','All living things are inherently good. Don''t kill! Go vegan! ');
INSERT INTO property VALUES('32UjISl8','k6TOT4uK','name','friendship');
INSERT INTO property VALUES('5aieFTV9','bXUvnZ2L','latin name','canine');
INSERT INTO property VALUES('71idkiQT','DFqjkPES','name','keith''s dog');
INSERT INTO property VALUES('BOdSWC7w','823VdnlZ','name','john');
INSERT INTO property VALUES('DNNp3jMI','x5JcrI3y','name','humans');
INSERT INTO property VALUES('DZ2dfVmQ','fzYkA7sH','project that made him the proudest','keith.ga');
INSERT INTO property VALUES('FX8LUzm0','zPKMwk4A','name','favourite pet');
INSERT INTO property VALUES('hHrDJ6HE','2WJmK4aP','name','relies on');
INSERT INTO property VALUES('IFZ3EHMX','fzYkA7sH','birth year','2002');
INSERT INTO property VALUES('Ugq4VWXq','x5JcrI3y','latin name','homo sapiens');
INSERT INTO property VALUES('VSeg1rJy','fzYkA7sH','ideology','anarchism');
INSERT INTO property VALUES('XjTbwo4l','gqJ8eqKU','name','men''s best friend');
INSERT INTO property VALUES('ZEwGlJWR','823VdnlZ','height','177cm');
INSERT INTO property VALUES('ZlfZxe2Z','gqJ8eqKU','taming history total length','more than 10000 years');
INSERT INTO property VALUES('bLrkndhu','fzYkA7sH','profession','programmer');
COMMIT;
