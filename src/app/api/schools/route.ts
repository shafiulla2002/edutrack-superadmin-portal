import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/serverFirebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snap = await adminDb.collection('schools').get();
    const schools: any[] = [];

    snap.forEach((doc) => {
      const data = doc.data();
      schools.push({
        id: doc.id,
        name: data.name || data.schoolName || 'Unnamed Institution',
        subDomain: data.subDomain || data.subdomain || doc.id,
        contactEmail: data.contactEmail || data.email || 'admin@school.edu',
        contactPhone: data.contactPhone || data.mobileNumber || data.phone || '',
        adminName: data.adminName || data.principalName || 'Principal',
        studentCount: Number(data.studentCount || 0),
        staffCount: Number(data.staffCount || data.teacherCount || 0),
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || data.postalCode || '',
        schoolType: data.schoolType || 'General Academy',
        status: data.status || 'ACTIVE',
        registrationSource: data.registrationSource || 'PORTAL',
        createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString()) : new Date().toISOString(),
        approvedAt: data.approvedAt ? (typeof data.approvedAt === 'string' ? data.approvedAt : new Date(data.approvedAt.seconds * 1000).toISOString()) : undefined,
        rejectionReason: data.rejectionReason,
        subscription: {
          status: data.subscription?.status || (data.status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : 'ACTIVE'),
          expiryDate: data.subscription?.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString(),
          billingCycle: data.subscription?.billingCycle || 'ANNUAL',
          plan: {
            name: data.subscription?.plan?.name || 'BASIC',
            price: Number(data.subscription?.plan?.price || 24999)
          }
        }
      });
    });

    schools.sort((a, b) => {
      if (a.status === 'PENDING_APPROVAL' && b.status !== 'PENDING_APPROVAL') return -1;
      if (b.status === 'PENDING_APPROVAL' && a.status !== 'PENDING_APPROVAL') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ success: true, schools });
  } catch (err: any) {
    console.error('[API /api/schools GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message, schools: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `sch-${(body.subDomain || 'school').toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    
    const newDoc = {
      ...body,
      id,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection('schools').doc(id).set(newDoc, { merge: true });
    return NextResponse.json({ success: true, id, school: newDoc });
  } catch (err: any) {
    console.error('[API /api/schools POST] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing school id' }, { status: 400 });
    }

    await adminDb.collection('schools').doc(id).set({
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[API /api/schools PUT] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing school id' }, { status: 400 });
    }

    await adminDb.collection('schools').doc(id).delete();
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[API /api/schools DELETE] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
