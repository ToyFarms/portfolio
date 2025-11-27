import { IGalleryImage } from "@/model/Gallery";
import { IProject } from "@/model/Project";

export type ResolvedProject = {
  imageResolved: IGalleryImage | null;
} & IProject;
