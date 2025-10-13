import { connectDB } from "@/lib/mongodb";
import GalleryImage from "@/model/Gallery";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  await connectDB();
  const result = await GalleryImage.updateMany({ tags: { $type: "string" } }, [
    {
      $set: {
        tags: {
          $map: {
            input: { $split: ["$tags", ","] },
            as: "t",
            in: { $trim: { input: "$$t" } },
          },
        },
      },
    },
  ]);

  console.log("Migration complete:", result);
  return NextResponse.json({});
}
