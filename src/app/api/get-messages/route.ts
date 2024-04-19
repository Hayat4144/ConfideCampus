import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth"
import dbConnect from "@/lib/dbConnection";
import mongoose from "mongoose";
import UserModel from "@/model/User.model";

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    
    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not authenticated"
            },
            { status: 401 }
        )
    }
    
    const userId = new mongoose.Types.ObjectId(user._id) 
    try {
        const user = await UserModel.aggregate([
            { $match: {id: userId} },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])

        if (!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 400 }
            )
        }

        return Response.json(
            {
                success: true,
                messages: user[0].messages
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error while Fetching messages', error);
        return Response.json(
            {
                success: false,
                message: "Error Fetching messages"
            },
            { status: 400 }
        )
    }
}

