<!--
If you don't follow the issue template, your issue may be closed.

Remember to properly format your code in code blocks.

Please note this is an issue tracker, not a support forum.
For general questions, please use one of these:
- StackOverflow: https://stackoverflow.com/questions/tagged/sequelize.js
- GitHub discussions: https://github.com/sequelize/sequelize/discussions
-->

## Issue Creation Checklist

- [x] I understand that my issue will be automatically closed if I don't fill in the requested information
- [x] I have read the [contribution guidelines](https://github.com/sequelize/sequelize/blob/main/CONTRIBUTING.md)

## Bug Description
I am using SQLite and am attempting to create a table with a custom id field that has `autoIncrement` set to true, however in some cases when I look at the database schema `AUTOINCREMENT` is not applied to that column.

I was using version 6.13.0 previously in this project.  I updated to latest (6.37.3) as one of my first steps to fix this issue, and that partially fixes it.  With the new version if I create a new database where the table does not exist the schema is correct.  But if I use a database that was created with 6.13.0 originally the migration does not fix that column.

### Reproducible Example

Here is the link to the SSCCE for this issue:[https://github.com/jvens/sequelize-sscce](https://github.com/jvens/sequelize-sscce)


Output from sequelize 6.13.0
```
-----------------------------------------------------------
===== Running SSCCE for SQLITE with Sequelize v6.13.0 =====
-----------------------------------------------------------
[Sequelize] Executed (default): CREATE TABLE IF NOT EXISTS `Foo` (`custom_id` INTEGER PRIMARY KEY AUTOINCREMENT, `value` VARCHAR(1024) NOT NULL); [Elapsed time: 38 ms]
[Sequelize] Executed (default): PRAGMA TABLE_INFO(`Foo`); [Elapsed time: 1 ms]
[Sequelize] Executed (default): PRAGMA foreign_key_list(`Foo`) [Elapsed time: 8 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 3 ms]
[Sequelize] Executed (default): PRAGMA foreign_key_list(`Foo`) [Elapsed time: 1 ms]
[Sequelize] Executed (default): PRAGMA TABLE_INFO(`Foo`); [Elapsed time: 2 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 1 ms]
[Sequelize] Executed (default): PRAGMA foreign_key_list(`Foo`) [Elapsed time: 2 ms]
[Sequelize] Executed (default): CREATE TABLE IF NOT EXISTS `Foo_backup` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL); [Elapsed time: 23 ms]
[Sequelize] Executed (default): INSERT INTO `Foo_backup` SELECT `custom_id`, `value` FROM `Foo`; [Elapsed time: 2 ms]
[Sequelize] Executed (default): DROP TABLE `Foo`; [Elapsed time: 45 ms]
[Sequelize] Executed (default): CREATE TABLE IF NOT EXISTS `Foo` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL); [Elapsed time: 20 ms]
[Sequelize] Executed (default): INSERT INTO `Foo` SELECT `custom_id`, `value` FROM `Foo_backup`; [Elapsed time: 1 ms]
[Sequelize] Executed (default): DROP TABLE `Foo_backup`; [Elapsed time: 17 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 1 ms]

[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 1!"} [Elapsed time: 15 ms]
[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 2!"} [Elapsed time: 19 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 4 ms]
Result 1:
1 Hello World 1! undefined
2 Hello World 2! undefined

[Sequelize] Executed (default): DELETE FROM `Foo` WHERE `custom_id` = 2 [Elapsed time: 16 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 3 ms]
Result 2:
1 Hello World 1! undefined

[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 3!"} [Elapsed time: 23 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 2 ms]
Result 3:
1 Hello World 1! undefined
2 Hello World 3! undefined

----------------------------------------
```

Note that the key `2` was reused.  Here is the database schema:
```
sqlite3 example.db
SQLite version 3.37.2 2022-01-06 13:25:41
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE `Foo` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL);
```
Note that `AUTOINCREMENT` is missing.

Running again after updating to 3.36 __WITHOUT DELETING__ the database gives the following:
```
-----------------------------------------------------------
===== Running SSCCE for SQLITE with Sequelize v6.37.3 =====
-----------------------------------------------------------
[Sequelize] Executed (default): SELECT name FROM sqlite_master WHERE type='table' AND name='Foo'; [Elapsed time: 1 ms]
[Sequelize] Executed (default): PRAGMA TABLE_INFO(`Foo`); [Elapsed time: 0 ms]
[Sequelize] Executed (default): PRAGMA foreign_key_list(`Foo`) [Elapsed time: 3 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 2 ms]
[Sequelize] Executed (default): PRAGMA foreign_key_list(`Foo`) [Elapsed time: 1 ms]
[Sequelize] Executed (default): PRAGMA TABLE_INFO(`Foo`); [Elapsed time: 0 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 0 ms]
[Sequelize] Executed (default): PRAGMA foreign_key_list(`Foo`) [Elapsed time: 0 ms]
[Sequelize] Executed (default): CREATE TABLE IF NOT EXISTS `Foo_backup` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL); [Elapsed time: 8 ms]
[Sequelize] Executed (default): INSERT INTO `Foo_backup` SELECT `custom_id`, `value` FROM `Foo`; [Elapsed time: 6 ms]
[Sequelize] Executed (default): DROP TABLE `Foo`; [Elapsed time: 5 ms]
[Sequelize] Executed (default): CREATE TABLE IF NOT EXISTS `Foo` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL); [Elapsed time: 9 ms]
[Sequelize] Executed (default): INSERT INTO `Foo` SELECT `custom_id`, `value` FROM `Foo_backup`; [Elapsed time: 23 ms]
[Sequelize] Executed (default): DROP TABLE `Foo_backup`; [Elapsed time: 9 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 0 ms]

[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 1!"} [Elapsed time: 5 ms]
[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 2!"} [Elapsed time: 4 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 2 ms]
Result 1:
1 Hello World 1! undefined
2 Hello World 3! undefined
3 Hello World 1! undefined
4 Hello World 2! undefined

[Sequelize] Executed (default): DELETE FROM `Foo` WHERE `custom_id` = 2 [Elapsed time: 7 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 1 ms]
Result 2:
1 Hello World 1! undefined
3 Hello World 1! undefined
4 Hello World 2! undefined

[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 3!"} [Elapsed time: 8 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 0 ms]
Result 3:
1 Hello World 1! undefined
3 Hello World 1! undefined
4 Hello World 2! undefined
5 Hello World 3! undefined

----------------------------------------
```

And the schema
```
sqlite3 example.db                                                                                     17:28:12
SQLite version 3.37.2 2022-01-06 13:25:41
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE `Foo` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL);
```
Note that `custom_id` does not have `AUTOINCREMENT` set.

If I __DELETE__ the database before running the program with the new version I get the following:
```
-----------------------------------------------------------
===== Running SSCCE for SQLITE with Sequelize v6.37.3 =====
-----------------------------------------------------------

[Sequelize] Executed (default): SELECT name FROM sqlite_master WHERE type='table' AND name='Foo'; [Elapsed time: 2 ms]
[Sequelize] Executed (default): CREATE TABLE IF NOT EXISTS `Foo` (`custom_id` INTEGER PRIMARY KEY AUTOINCREMENT, `value` VARCHAR(1024) NOT NULL); [Elapsed time: 21 ms]
[Sequelize] Executed (default): PRAGMA INDEX_LIST(`Foo`) [Elapsed time: 0 ms]

[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 1!"} [Elapsed time: 24 ms]
[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 2!"} [Elapsed time: 20 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 4 ms]
Result 1:
1 Hello World 1! undefined
2 Hello World 2! undefined

[Sequelize] Executed (default): DELETE FROM `Foo` WHERE `custom_id` = 2 [Elapsed time: 21 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 2 ms]
Result 2:
1 Hello World 1! undefined

[Sequelize] Executed (default): INSERT INTO `Foo` (`custom_id`,`value`) VALUES (NULL,$1); {"$1":"Hello World 3!"} [Elapsed time: 19 ms]
[Sequelize] Executed (default): SELECT `custom_id`, `value` FROM `Foo` AS `Foo`; [Elapsed time: 4 ms]
Result 3:
1 Hello World 1! undefined
3 Hello World 3! undefined

----------------------------------------
```
Note that id `2` was not reused.  And the schema is as expected:

```
sqlite3 example.db                                                                                     17:30:26
SQLite version 3.37.2 2022-01-06 13:25:41
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE `Foo` (`custom_id` INTEGER PRIMARY KEY AUTOINCREMENT, `value` VARCHAR(1024) NOT NULL);
CREATE TABLE sqlite_sequence(name,seq);
```
Note that `custom_id` is correctly set to have `AUTOINCREMENT

### What do you expect to happen?
I would expect after updating sequalize that the `custom_id` column would have `AUTOINCREMENT` set in the schema.

### What is actually happening?
It is not set. This is the only time I have noticed this issue, but I wonder if there are other cases where the `AUTOINCREMENT` might get deleted from the column during the migration process.  Possibly related to #8673.

### Environment

<!---
Please answer the questions below. If you don't, your issue will be closed.

To find the version numbers for the three systems below use the following commands:
- `npm list sequelize` / `yarn list --pattern sequelize` (v6 stable)
- `npm list @sequelize/core` / `yarn list --pattern @sequelize/core` (v7 alpha)
- `node -v`
- `npm list typescript` / `yarn list --pattern typescript`
- 'Database' is which actual database system you're using. e.g. 'PostgreSQL 14', 'MariaDB 10.11', etc…
- 'Connector library' is the dependency sequelize requires you to install to interact with a given database type.
  e.g. 'pg' or 'pg-native' for PostgreSQL, 'mysql2' for MySQL, 'tedious' for SQL Server, etc… (see README for complete list).
--->

- Sequelize version: 6.13.0 and 6.37.3
- Node.js version: 18.17.1
- If TypeScript related: TypeScript version: 4.5.5
- Database & Version: sqlite3
- Connector library & Version: N/A

## Would you be willing to resolve this issue by submitting a Pull Request?

<!-- Remember that first contributors are welcome! -->

- [ ] Yes, I have the time and I know how to start.
- [x] Yes, I have the time but I will need guidance.
- [ ] No, I don't have the time, but my company or I are [supporting Sequelize through donations on OpenCollective](https://opencollective.com/sequelize).
- [ ] No, I don't have the time, and I understand that I will need to wait until someone from the community or maintainers is interested in resolving my issue.

---

<!-- do not delete this footer -->

_Indicate your interest in the resolution of this issue by adding the 👍 reaction. Comments such as "+1" will be removed._
