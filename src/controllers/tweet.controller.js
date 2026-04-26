import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    
    const {content}= req.body;

    if(!content || content.trim() === ""){
        throw new ApiError(400,"Tweet content not found or is empty")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet added successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"User id is not valid")
    }

    const getTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, getTweets, "All tweets have been fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet id is not valid")
    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"Content is empty or not found")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"tweet is not present")
    }

    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You do not have permission to edit this tweet")
    }

    tweet.content=content

    await tweet.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet has been updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet id is not valid")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"tweet is not present")
    }

    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You do not have permission to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet has been deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
