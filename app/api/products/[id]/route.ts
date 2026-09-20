import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    let product;
    // Check if id is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } 
    
    // Fallback: Check if we have an old string id or slug
    if (!product) {
      product = await Product.findOne({ id: id });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const detail = (formData.get('detail') as string) || '';
    const oldPrice = formData.get('oldPrice') ? Number(formData.get('oldPrice')) : undefined;
    const isDeal = formData.get('isDeal') === 'true';
    const image = formData.get('image') as File | null;

    if (!name || !description || !category || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData: any = {
      name, description, category, price, stock, detail, oldPrice, isDeal
    };

    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        const cloudinary = (await import('@/lib/cloudinary')).default;
        updateData.image = await new Promise<string>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'grovli/products' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            }
          ).end(buffer);
        });
      } catch (uploadError: any) {
        console.error('[Cloudinary upload error]', uploadError.message, 'Falling back to local storage.');
        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        updateData.image = `/uploads/${filename}`;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('[PUT /api/products/[id]] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/products/[id]] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
