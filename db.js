const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.$queryRaw`SELECT * FROM "VideoData"`
  .then((val) => {
    console.log(val);
  })
  .catch((err) => {
    console.log(err);
  });
