import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema(
  {
    salesPerson: {
      type: String,
      default: '',
      trim: true,
    },
    assignDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Please provide an assign date'],
    },
    month: {
      type: String,
      required: true,
    },
    profileName: {
      type: String,
      default: '',
      trim: true,
    },
    clientUserId: {
      type: String,
      required: [true, 'Please provide a client user ID'],
      trim: true,
    },
    orderNumber: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    assignedMembers: {
      type: [String],
      default: [],
    },
    estimatedDeliveryDate: {
      type: String,
      default: '',
    },
    deliveryDate: {
      type: String,
      default: '',
    },
    remark: {
      type: String,
      default: '',
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: ['Wip', 'Delivered', 'Done', 'NRA', 'Cancel', 'Need Requirements', 'Issue'],
      default: 'Wip',
    },
    timeSchedule: {
      type: String,
      default: 'Fresh Query',
      trim: true,
    },
    sheetLink: {
      type: String,
      default: '',
      trim: true,
    },
    teamName: {
      type: String,
      default: 'EleSquad',
      trim: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    userEmail: {
      type: String,
      default: 'alirejakhan36@gmail.com',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema);
