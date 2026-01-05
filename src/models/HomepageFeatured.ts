import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHomepageFeatured extends Document {
  ringsProductId?: string
  earringsProductId?: string
  necklacesProductId?: string
  braceletsProductId?: string
  updatedAt: Date
  createdAt: Date
}

const HomepageFeaturedSchema = new Schema<IHomepageFeatured>(
  {
    ringsProductId: { type: String },
    earringsProductId: { type: String },
    necklacesProductId: { type: String },
    braceletsProductId: { type: String },
  },
  {
    timestamps: true,
  }
)

export const HomepageFeatured: Model<IHomepageFeatured> =
  mongoose.models.HomepageFeatured ||
  mongoose.model<IHomepageFeatured>('HomepageFeatured', HomepageFeaturedSchema)

