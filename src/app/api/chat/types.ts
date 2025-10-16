import { z } from "zod";

export const chatroomPutSchema = z.object({
  userId: z.string(),
});

export type ChatroomPut = z.infer<typeof chatroomPutSchema>;

export const chatroomGetSchema = z.object({
  chatroomId: z.string(),
});

export type ChatroomGet = z.infer<typeof chatroomPutSchema>;

export const chatSendMessageSchema = z.object({
  chatroomId: z.string(),
  content: z.string(),
});

export type ChatSendMessage = z.infer<typeof chatSendMessageSchema>;
