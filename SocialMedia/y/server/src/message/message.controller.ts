import { Body, Controller, Post, Get, Param, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards, Req, Delete } from "@nestjs/common";
import { MessageDto, SentMessagesDto } from "./dto";
import { MessageService } from "./message.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";
import { diskStorage } from "multer";
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { Message } from "@prisma/client";


export const imagestorage = {
    storage: diskStorage({
      destination: './uploads/messageimages',
      filename: (req, file, cb) => {
        const filename: string =
          path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string = path.parse(file.originalname).ext;
  
        cb(null, `${filename}${extension}`);
      },
    }),
  };


@Controller('messages')
export class MessageController{

    constructor(private messageService: MessageService){}

    @Post('send')
    sendMessage(@Body() dto: MessageDto){
        console.log(dto)
        return this.messageService.sendMessage(dto)
    }

    @Get('sentMessages/:senderId/:receiverId')
    allMessages(@Param('senderId', ParseIntPipe) senderId: number, @Param('receiverId', ParseIntPipe) receiverId: number,){
        return this.messageService.allMessages(senderId, receiverId)
    }

    @Get('findMessages/:senderId/:receiverId/:toFind')
    allFoundMessages(@Param('senderId', ParseIntPipe) senderId: number, @Param('receiverId', ParseIntPipe) receiverId: number, @Param('toFind') toFind: string){
        return this.messageService.allFoundMessages(senderId, receiverId, toFind)
    }


    @Post('create/:receiverId/:senderId')
    @UseInterceptors(FileInterceptor('file', imagestorage))
    sendMessageNew(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: any,
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Param('senderId', ParseIntPipe) senderId: number,
    ) {
    let fileName: string | undefined;
    const content = body.messageContent;

    if (file) {
        fileName = process.env.MESSAGES_PHOTO_PATH + file.filename;
    }

    return this.messageService.createMessage(
        receiverId,
        senderId,
        content,
        fileName,
    );
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('like/:messageId/:userId')
    async likeMessage(@Param('messageId', ParseIntPipe) messageId: number, @Param('userId', ParseIntPipe) userId: number) {
        try {
            await this.messageService.likeMessage(messageId, userId);
        } catch (error) {
            throw error;
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('delete/:messageId')
    async delete(@Param('messageId', ParseIntPipe) messageId: number) {
        try{
            await this.messageService.delete(messageId);
        } catch(error){
            throw error;
        }
    }
}

