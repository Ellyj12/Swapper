import mongoose from "mongoose";

const swapSchema = new mongoose.Schema({
  offeror: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  offerorItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  requesterItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  status: {
    type: string,
    enum: ["Pending", "Accepted", "Declined", "Completed"],
    default: "Pending",
  },

  offerorCode: { type: String, required: true },
  requestorCode: { type: String, required: true },


  confirmedByOfferor:{type:Boolean,default:false},
  confirmedByRequestor:{type:Boolean,default:false}
}, {timestamps:true});

export const Swap = mongoose.model('Swap',swapSchema)
