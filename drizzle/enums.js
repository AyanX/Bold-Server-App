const { mysqlEnum } = require("drizzle-orm/mysql-core");
 const userRoleEnum = mysqlEnum("user_role", [
  "Admin",
  "Editor",
  "Contributor",
  "Viewer",
]);

const userStatusEnum = mysqlEnum("user_status", [
  "Active",
  "Inactive",
  "Suspended",
  "Pending",
]);


const articlesStatusEnum = mysqlEnum("article_status", [
  "Draft",
  "Published",
  "Archived",
]);

module.exports = { userRoleEnum, userStatusEnum, articlesStatusEnum };