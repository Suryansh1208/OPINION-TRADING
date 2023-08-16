const router = require("express").Router();
const userbidController = require('../controllers/userbidController')

router.patch("/update_bid/:mobile/:opinion_id", userbidController.update_bid);
router.get("/", userbidController.all_bids);
router.get("/:mobile", userbidController.get_bid);
router.post("/", userbidController.add_bid);
router.delete("/:mobile/:opinion_id", userbidController.delete_bid);

module.exports = router;
