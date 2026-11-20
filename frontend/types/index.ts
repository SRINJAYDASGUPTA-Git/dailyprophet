// @/types/index.ts

import {NextApiRequest} from "next";

export interface WizardingWorldProfile {
    uid?: string;
    profileUrl?: string;
    name?: string;
    house?: string;
    avatar?: string;
    patronus?: PatronusResponse;
    wand?: WandResponse;
}


export interface WandRequest {
    wandKey?: string;
    length?: string;
    wood?: string;
    core?: string;
    flexibility?: string;
    imageUrl?: string;
}

export interface WandResponse {
    wandKey?: string;
    length?: string;
    wood?: string;
    core?: string;
    flexibility?: string;
    imageUrl?: string;
}

export interface UserUpdateRequest {
    name?: string;
    imageUrl?: string;
}

export interface HouseRequest {
    name?: string;
    imageUrl?: string;
}

export interface HouseResponse {
    name?: string;
    imageUrl?: string;
}

export interface PatronusRequest {
    name?: string;
    imageUrl?: string;
}

export interface PatronusResponse {
    name?: string;
    imageUrl?: string;
}

export interface PostRequest {
    postId?: string;
    caption?: string;
    mediaUrls?: string[];
}

export interface PostResponse {
    id?: string;
    caption?: string;
    timestamp?: string;
    ownerId?: string;
    isDeleted?: boolean;
    isArchived?: boolean;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
    savesCount?: number;
    mediaUrls?: string[];
}

export interface UserLeanResponse {
    id?: string;
    name?: string;
    username?: string;
    imageUrl?: string;
}

export interface UserFullResponse {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
    imageUrl?: string;
    accountLocked?: boolean;
    enabled?: boolean;
    roles?: string[];
    posts?: PostResponse[];
    followers?: UserLeanResponse[];
    following?: UserLeanResponse[];
    wand?: WandResponse;
    patronus?: PatronusResponse;
    house?: HouseResponse;
}

export interface CommentRequest {
    commentId?: string;
    postId?: string;
    body?: string;
}

export interface CommentResponse {
    id?: string;
    postId?: string;
    body?: string;
    author?: UserLeanResponse;
    likes?: number;
    replyCount?: number;
    edited?: boolean;
    timestamp?: string;
}

export interface AuthenticationRequest extends Request{
    email?: string;
    password?: string;
    name?: string;
    username?: string;
    imageUrl?: string;
}

export interface AuthenticationResponse {
    access_token?: string;
    refresh_token?: string;
}

export interface VerifyWWAccessRequest extends Request{
    oldName?: string;
    specialCharUnicode?: string;
    uid?: string;
}

export interface PageResponse<T> {
    content?: T[];
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
}

export interface DirectMessage {
    id?: string;
    senderUsername?: string;
    recipientUsername?: string;
    messageType?: string;
    content?: string;
    timestamp?: string;
}