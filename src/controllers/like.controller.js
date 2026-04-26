import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is not valid")
    }

    const existingLike = await Like.findOne({video: videoId, likedBy: req.user?._id})
    let isLiked;

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        isLiked= false
    }
    else{
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
        isLiked=true
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{isLiked},"Like has been toggled successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Video id is not valid")
    }

    const existingLike = await Like.findOne({comment: commentId, likedBy: req.user?._id})
    let isLiked;

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        isLiked= false
    }
    else{
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        isLiked=true
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{isLiked},"Like has been toggled successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Video id is not valid")
    }

    const existingLike = await Like.findOne({tweet: tweetId, likedBy: req.user?._id})
    let isLiked;

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        isLiked= false
    }
    else{
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        isLiked=true
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{isLiked},"Like has been toggled successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField:"video",
                foreignField:"_id",
                as: "likedVideo"
            }
        },
        {
            $unwind: "$likedVideo"
        },{
            $project: {
                "likedVideo.title": 1,
                "likedVideo.thumbnail": 1,
                "likedVideo.owner": 1
            }
        }
    ])

    return res
        .status(200)
        .json(200,likedVideos,"All liked video is successfully fetched")
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}