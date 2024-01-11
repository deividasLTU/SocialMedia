import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MessageDto, SentMessagesDto } from "./dto";
import { Message } from "@prisma/client";
import { promises as fsPromises } from 'fs';

@Injectable()
export class MessageService{
    constructor(private prisma: PrismaService){}

    async sendMessage(dto: MessageDto) {
        try {
          const messageData: any = {
            senderId: dto.senderId,
            receiverId: dto.receiverId,
            messageContent: dto.messageContent,
          };
      
          if (dto.messageImage) {
            messageData.messageImage = dto.messageImage;
          }
      
          const message = await this.prisma.message.create({
            data: messageData,
          });
      
          return 'Message created successfully!';
        } catch (error) {
          throw error;
        }
      }

    async allMessages(senderId: number, receiverId: number){
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                  ],
            },
            orderBy: {
                sentAt: 'asc'
            },
        });

        return messages
    }

    async allFoundMessages(senderId: number, receiverId: number, toFind: string) {
      const messages = await this.prisma.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
          messageContent: {
            contains: toFind,
            mode: 'insensitive',
          },
        },
        orderBy: {
          sentAt: 'asc',
        },
      });
    
      return messages;
    }

    async createMessage(receiverId, senderId, messageContent: string, fileName?: string) {
        try {
          const messageData: any = {
            senderId: senderId,
            receiverId: receiverId,
            messageContent: messageContent
          };
      
          if (fileName) {
            messageData.messageImage = fileName;
          }
          
          if(messageData.messageContent == "" && !fileName){
              return;
          }
          const message = await this.prisma.message.create({
            data: messageData,
          });
      
          return message;
        } catch (error) {
          throw error;
        }
    }

    async likeMessage(messageId: number, userId: number) {
        try {
          const existingMessage = await this.prisma.message.findUnique({
            where: {
              id: messageId,
            },
          });
      
          if (existingMessage) {
            if (!existingMessage.isLiked) {
              await this.prisma.message.update({
                where: {
                  id: messageId,
                },
                data: {
                  isLiked: true,
                },
              });
              await this.prisma.message.update({
                where: {
                  id: messageId,
                },
                data: {
                  likedUserId: userId,
                },
              });
            }
            if (existingMessage.isLiked && userId == existingMessage.likedUserId) {
                await this.prisma.message.update({
                  where: {
                    id: messageId,
                  },
                  data: {
                    isLiked: false,
                  },
                });
                await this.prisma.message.update({
                  where: {
                    id: messageId,
                  },
                  data: {
                    likedUserId: -1,
                  },
                });
              }
          }
      
          return 'Message liked successfully!';
        } catch (error) {
          throw error;
        }
      }

      async delete(messageId: number) {
        try {
          const messageIdToDelete = await this.prisma.message.findUnique({
            where: {
              id: messageId,
            },
            select: {
              id: true,
            },
          });
      
          if (!messageIdToDelete) {
            throw new Error('Message not found');
          }
      
          const deletedMessage = await this.prisma.message.delete({
            where: { id: messageId },
          });
      
          if (!deletedMessage) {
            throw new Error('Invalid message');
          }
      
          return deletedMessage;
        } catch (e) {
          console.error('Error deleting message:', e);
          throw e;
        }
      }


}