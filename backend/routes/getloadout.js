const express = require('express');
const router = express.Router();
const prisma = require('../prismaclient');

router.get('/', checkAuthenticated, async (req, res) => {
  try {
    var loadouts = [];
    //console.log(req.query);
    async function main() {
      const user = await prisma.users.findUniqueOrThrow({
        where: {
          name: req.query.data,
        },
      });

      loadouts = await prisma.loadouts.findMany({
        where: {
          user_id: user.id,
        },
      });
    }
    main()
      .then(async () => {
        await prisma.$disconnect();
        return res.status(200).json({ loadouts: loadouts });
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        throw e;
      });
  } catch (e) {
    return res.status(500).json({ loadouts: [] });
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send('Please log in');
}

module.exports = router;
