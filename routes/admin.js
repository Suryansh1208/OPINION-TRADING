const router = require("express").Router();
const adminController = require('../controllers/adminController')

router.patch("/update/:mobile", adminController.update_admin);
router.get("/:role", adminController.all_admins);
router.get("/", adminController.get_admin);
router.post("/", adminController.add_admin);
router.delete("/delete/:mobile", adminController.delete_admin);
router.post("/signup", adminController.sign_up);
router.post("/login", adminController.login);
router.post("/forgot-password", adminController.forget);
router.get("/reset-password/:id/:token", adminController.getToken);
router.post("/reset-password/:id/:token", adminController.postToken);

module.exports = router;
