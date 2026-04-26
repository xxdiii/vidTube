import mongoose, {isValidObjectId, set} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pipeline =[];

    if(query){
        pipeline.push(
            {
                $match: {
                    $or: [
                        {title: {$regex: query, $options: "i"}},
                        {description: {$regex: query, $options: "i"}}
                    ]
                }
            }
        )
    }

    if(userId && isValidObjectId(userId)){
        pipeline.push(
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
        )
    }   

    pipeline.push(
        {
            $match: {
                isPublished: true
            }
        }
    )

    if(sortBy && sortType){

        const sortOrder = sortType === "asc" ? 1: -1;
        pipeline.push(
            {
                $sort: {
                    [sortBy]: sortOrder 
                }
            }
        )
    }

    const videoAggregateQuery = Video.aggregate(pipeline)

    const options = {
        page: parseInt(page,10),
        limit: parseInt(limit,10),
    }

    const paginatedVideos = await Video.aggregatePaginate(videoAggregateQuery,options)

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            paginatedVideos,
            "Video fetched successfully"
        ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if([title, description].some((field)=>field?.trim() ==="")){
        throw new ApiError(400,"Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Failed to upload video to Cloudinary");
    }
    if (!thumbnail) {
        throw new ApiError(400, "Failed to upload thumbnail to Cloudinary");
    }
    
    try {
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            owner: req.user._id
        })

        if (!video) {
            throw new ApiError(500, "Something went wrong while creating the video document");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video has been uploaded successfully"))
    } catch (error) {
        throw new ApiError(400,"Something went wrong while uploading video")
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId not valid")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if(!video?.length){
        throw new ApiError(400,"Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video Details fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if(!title && !description && !req.file){
        throw new ApiError(400,"Title and description are required")
    }

    const updateFields= {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    const thumbnailLocalPath = req.file?.path

    if(thumbnailLocalPath){
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail){
            throw new ApiError(400,"Something went wrong while uploading")
        }
        updateFields.thumbnail = thumbnail.url;
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        {new: true}
    )

    if(!video){
        throw new ApiError(400,"Video not found")
    }

    return res  
        .status(200)
        .json(new ApiResponse(200, video, "Video details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    const {videoFile, thumbnail, owner} = video
    if(owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"video is not the owners")
    }

    if(videoFile){
        const videoPublicId = videoFile.split('/').pop().split('.')[0]; 
        await deleteFromCloudinary(videoPublicId);
    }
    if(thumbnail){
        const thumbnailPublicId = thumbnail.split('/').pop().split('.')[0];
        await deleteFromCloudinary(thumbnailPublicId);
    }

    const delVideo = await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {},"Deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"video is not the owners")
    }
    video.isPublished = !video.isPublished

    await video.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, video, "Toggled publish status"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
