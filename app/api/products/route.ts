import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    await connectToDatabase();
    const filter = category && category !== 'all' ? { category } : {};
    const products = await Product.find(filter).lean().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('[GET /api/products] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!name || !description || !category || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: 'Missing required fields: name, description, category, price, stock' }, { status: 400 });
    }

    let imageUrl = '';

    // Upload image to Cloudinary only if provided
    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const cloudinary = (await import('@/lib/cloudinary')).default;

        imageUrl = await new Promise<string>((resolve, reject) => {
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
        
        // Fallback: save to public/uploads
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, filename);
        
        await fs.writeFile(filePath, buffer);
        imageUrl = `/uploads/${filename}`;
      }
    }

    await connectToDatabase();

    const product = await Product.create({
      name,
      description,
      detail,
      price,
      oldPrice,
      category,
      stock,
      isDeal,
      image: imageUrl,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/products] Error:', error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
