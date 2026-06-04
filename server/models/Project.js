import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    focus: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      default: "",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    projectUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubRepo: {
      type: String,
      default: "",
      trim: true,
    },
    githubUpdatedAt: {
      type: String,
      default: "",
      trim: true,
    },
    githubStars: {
      type: Number,
      default: 0,
    },
    githubForks: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ["manual", "github"],
      default: "manual",
    },
    apkUrl: {
      type: String,
      default: "",
      trim: true,
    },
    apkName: {
      type: String,
      default: "",
      trim: true,
    },
    screenshots: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          alt: {
            type: String,
            default: "",
            trim: true,
          },
        },
      ],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Project = mongoose.model("Project", projectSchema);
