const { customType } = require("drizzle-orm/mysql-core");

const mysqlSet = (allowed) =>
  customType({
    dataType() {
      return `SET(${allowed.map(v => `'${v}'`).join(',')})`;
    },
    fromDriver(value) {
      if (!value) return [];
      return value.split(',');
    },
    toDriver(value) {
      if (!Array.isArray(value) || value.length === 0) return '';
      return value.join(',');
    },
  });

module.exports = { mysqlSet };
