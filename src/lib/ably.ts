import Ably from "ably";

export const ablyRest = new Ably.Rest({
  key: process.env.ABLY_API_KEY!,
});
