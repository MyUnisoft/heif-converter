// Import Third-Party Dependencies
const { familySync, MUSL } = require("detect-libc");

console.log(familySync() === MUSL ? "musl" : "");
