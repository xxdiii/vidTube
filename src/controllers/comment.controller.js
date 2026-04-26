import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { lookup } from "dns"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video id is not valid")
    }

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userData",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                    
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$userData"
                }
            }
        },{
            $sort: {
                createdAt: -1
            }
        }
        
        
    ]

    const commentAggregateQuery = Comment.aggregate(pipeline)

    const options = {
        page: parseInt(page,10),
        limit: parseInt(limit,10),
    }

    const paginatedComments = await Comment.aggregatePaginate(commentAggregateQuery,options)

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            paginatedComments,
            "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId}= req.params;
    const {content}=req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video Id is not valid")
    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"content is not present")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId ,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(400,"comment is not present")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment has been added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content}= req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Comment Id is not valid")
    }
    if(!content || content.trim()===""){
        throw new ApiError(400,"content is not present")
    }

    const comment = await Comment.findById(commentId)

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this comment");
    }

    if(!comment){
        throw new ApiError(400,"comment is not present")
    }

    comment.content=content
    await comment.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(new ApiResponse(200,comment, "Comment has been updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Comment Id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId)
    return res
        .status(200)
        .json(new ApiResponse(200,{}, "Comment has been deleted"))

})  

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}
