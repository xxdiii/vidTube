import mongoose, {isValidObjectId, mongo} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Channel id is not valid")
    }

    const existingSubscriber = await Subscription.findOne({channel: channelId, subscriber: req.user?._id})
    let isSubscribed;

    if(existingSubscriber){
        await Subscription.findByIdAndDelete(existingSubscriber._id)
        isSubscribed = false
    }
    else{
        await Subscription.create({
            channel: channelId,
            subscriber: req.user?._id
        })
        isSubscribed = true
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{isSubscribed}, "Subscription has been toggled successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params  
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Channel id is not valid")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
        },{
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        },{
            $project: {
                subscriber: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200,subscribers, "Subscriber list has been fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"subscribed id is not valid")
    }

    const subscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
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
            $addfields: {
                subscribedChannel: {
                    $first: "$subscribedChannel"
                }
            }
        },
        {
            $project: {
                subscribedChannel: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200,subscribed, "Subscribed list has been fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}