import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/").get(getAllVideos)
router.route("/").post(
    upload.fields([
        { name: "videoFile", maxCount: 1},
        { name: "thumbnail", maxCount: 1},
    ]),
    publishAVideo)
router.route("/v/:videoId").get(getVideoById)
router.route("/v/:videoId").patch(upload.single("thumbnail"),updateVideo)
router.route("/v/:videoId").delete(deleteVideo)
router.route("/toggle/publish/v/:videoId").patch(togglePublishStatus)

export default router
