export function testManager(status = "SUCCESS", type = "POTOTYPE POLUTION", ...msgs) {
  return console.log(`
    [${type.toUpperCase()}:${status.toUpperCase()}]\n
    ${msgs.join("")}
  `);
};