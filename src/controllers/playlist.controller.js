import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if(!name || name.trim() ===""){
        throw new ApiError(400,"Name not found")
    }
    
    if(!description || description.trim() ===""){
        throw new ApiError(400,"Description not found")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(200,playlist,"Playlist has been successfully created")
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"User Id is not valid")
    }

    const displayPlaylist = await Playlist.find({owner: userId}).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, displayPlaylist, "All playlist is fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist Id is not valid")
    }

    const playList = await Playlist.findById(playlistId).populate("videos")

    if(!playList){
        throw new ApiError(400,"Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playList, "PlayList is fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id is not valid")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400 ,"Video id is not valid")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You cant update this playlist")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {videos: videoId}
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200,updatePlaylist, "Video has been added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id is not valid")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400 ,"Video id is not valid")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You cant update this playlist")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200,updatePlaylist, "Video has been removed from playlist"))
    
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id is not valid")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You cant update this playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(new ApiResponse(200,{}, "Playlist has been removed"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id is not valid")
    }

    if(!name || name.trim() ===""){
        throw new ApiError(400,"Name not found")
    }
    
    if(!description || description.trim() ===""){
        throw new ApiError(400,"Description not found")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You cant update this playlist")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description
        },
        {new: true}
    )

    return res
        .status(200)
        .json(new ApiResponse(200,updatePlaylist, "Playlist has been updated"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
