import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"User id is not valid")
    }

    const totalSubscriber = await Subscription.countDocuments({channel: userId})

    const totalVideoAndView = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"}
            }
        }
    ])

    const totalLikes = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $project: {
                likeCount: {$size: "$videoLikes"}
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: "$likeCount"}
            }
        }
    ])
    
    const stats = {
        totalSubscribers: totalSubscribers,
        totalVideos: videoStats.length > 0 ? videoStats[0].totalVideos : 0,
        totalViews: videoStats.length > 0 ? videoStats[0].totalViews : 0,
        totalLikes: likeStats.length > 0 ? likeStats[0].totalLikes : 0
    };

    return res
        .status(200)
        .json(new ApiResponse
            (200, 
            stats,
            "Channel stats fetched successfully")
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId= req.user?._id
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"User id is not valid")
    }

    const allVideos = await Video.find({owner: userId}).sort({createdAt: -1})

    return res
        .status(200)
        .json(new ApiResponse(200,allVideos, "All video details fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}