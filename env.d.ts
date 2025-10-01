import { Model } from "mongoose";
import { IUser } from "@/model/User";
import { IGalleryImage } from "@/model/Gallery";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI?: string;
    }
  }
}

declare module "mongoose" {
  interface Models {
    User: Model<IUser>;
    GalleryImage: Model<IGalleryImage>;
  }
}

declare module "*.png";
declare module "*.css";

export {};
