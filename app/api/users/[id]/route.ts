import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const data = await request.json();
    
    // Only allow updating certain fields for security
    const updateFields: any = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.phone !== undefined) updateFields.phone = data.phone;
    if (data.vehicleType !== undefined) updateFields.vehicleType = data.vehicleType;
    if (data.isAvailable !== undefined) updateFields.isAvailable = data.isAvailable;
    if (data.currentLocation !== undefined) updateFields.currentLocation = data.currentLocation;

    const user = await User.findByIdAndUpdate(
      resolvedParams.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return safe user object (no password)
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isApproved: user.isApproved,
      isAvailable: user.isAvailable,
      vehicleType: user.vehicleType
    };

    return NextResponse.json(safeUser, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
