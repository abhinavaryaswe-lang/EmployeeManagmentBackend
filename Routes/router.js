const express = require("express");
const router = new express.Router();
const controllers = require("../Controllers/usersControllers");


// routes
router.post("/user/register",controllers.userpost);
router.get("/user/details", controllers.userget);
router.get("/user/:id",controllers.singleuserget);
router.put("/user/edit/:id",controllers.useredit);
router.delete("/user/delete/:id",controllers.userdelete);
router.put("/user/status/:id", controllers.userstatus);
router.get("/userexport",controllers.userExport);

module.exports = router
