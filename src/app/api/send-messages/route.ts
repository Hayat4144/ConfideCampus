import dbConnect from "@/lib/dbConnection";
import { Message } from "@/model/User.model";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, content } = await request.json()

        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 400 }
            )
        }

        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages"
                },
                { status: 400 }
            )
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json(
            {
                success: true,
                message: "Message sent successfully"
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error while Sending messages', error);
        return Response.json(
            {
                success: false,
                message: "Error Sending messages"
            },
            { status: 400 }
        )
    }

}