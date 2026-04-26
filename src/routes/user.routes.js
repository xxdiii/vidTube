import { Router } from "express"
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getcurrentUser, getUserChannelProfile, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


//Unsecured Routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


//Secured Routes
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)// Done
router.route("/current-user").get(verifyJWT, getcurrentUser)//done
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)//done
router.route("/update-account").patch(verifyJWT, updateAccountDetails)//done
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)//done
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)

export default router;