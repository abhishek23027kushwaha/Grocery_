import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    detail: { type: String }, // e.g. "500g", "1 dozen"
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    category: { type: String, required: true }, // category slug e.g. 'fruits', 'dairy-eggs'
    image: { type: String, default: '' }, // Cloudinary URL (optional)
    stock: { type: Number, required: true, default: 0 },
    isDeal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Delete cached model to avoid stale schema on hot reload
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
