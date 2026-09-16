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
    orderNumber: {
      type: String,
      default: '',
      trim: true,
    },
    salesPerson: {
      type: String,
      default: '',
      trim: true,
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
    percentage: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: ['Wip', 'Delivered', 'Done', 'NRA', 'Cancel', 'Need Requirements', 'Issue', 'Assigned'],
      default: 'Wip',
    },
    currentStatus: {
      type: String,
      enum: ['All Sorted', 'Issue', 'WIP', 'Solved'],
      default: 'All Sorted',
    },
    issueNote: {
      type: String,
      default: '',
      trim: true,
    },
    solvedAt: {
      type: Date,
      default: null,
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
      default: 'Fresh Query',
      trim: true,
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

if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export default mongoose.model('Project', ProjectSchema);
