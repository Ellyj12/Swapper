import mongoose from "mongoose";
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    condition: { type: String, enum: ["New", "Like New ", "Used", "Damaged"] },
    type:{type:String, enum:['Trade','Free']},
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    desiredItem:{type:String,required:true},
    desiredCategory:{type:mongoose.Schema.Types.ObjectId, ref:"Category"},
    listingDuration: { type: Date, default: Date.now + TWO_WEEKS },
    createdAt: { type: Date, default: Date.now },
    isAvailable: { type: Boolean, default: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);

itemSchema.index({ location: "2dsphere" });

const Item = mongoose.model("Item", itemSchema);
export default Item;
