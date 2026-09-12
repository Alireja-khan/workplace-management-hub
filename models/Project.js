import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      default: 'alirejakhan36@gmail.com',
      trim: true,
      lowercase: true,
    },
    assignDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    month: {
      type: String,
      default: 'April',
    },
    clientUsername: {
      type: String,
      required: [true, 'Client username is required'],
      trim: true,
    },
    profileName: {
      type: String,
      required: [true, 'Profile name is required'],
      trim: true,
    },
    instructionSheet: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: ['Wip', 'Done', 'Delivered', 'Issue', 'Cancel', 'Assigned'],
      default: 'Wip',
    },
    ourSubdomain: {
      type: String,
      default: '',
      trim: true,
    },
    deadline: {
      type: String,
      default: '',
    },
    timeSchedule: {
      type: String,
      enum: ['Complete', 'Late', 'Need domain', 'Repeat Order', 'Add-on', 'Regular'],
      default: 'Complete',
    },
    clientDomain: {
      type: String,
      default: '',
      trim: true,
    },
    marketplaceStatus: {
      type: String,
      default: 'Wip',
    },
    dailyUpdate: {
      type: String,
      default: '',
    },
    futurePlan: {
      type: String,
      default: '',
    },
    review: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    backupInfo: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for Net Earning (without 20% platform cut)
ProjectSchema.virtual('netAmount').get(function () {
  return (this.amount || 0) * 0.8;
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
