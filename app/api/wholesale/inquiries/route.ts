import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function POST(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null;

  try {
    const body = await request.json();
    const {
      companyName,
      contactPerson,
      email,
      phone,
      businessType,
      expectedVolume,
      message
    } = body;

    // Validation
    if (!companyName || !contactPerson || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Company name, contact person, email, and phone are required' },
        { status: 400 }
      );
    }

    pool = await sql.connect(sqlConfig);

    // Insert inquiry
    await pool.request()
      .input('companyName', sql.NVarChar(255), companyName)
      .input('contactPerson', sql.NVarChar(255), contactPerson)
      .input('email', sql.NVarChar(255), email)
      .input('phone', sql.NVarChar(50), phone)
      .input('businessType', sql.NVarChar(100), businessType || null)
      .input('expectedVolume', sql.NVarChar(100), expectedVolume || null)
      .input('message', sql.NVarChar(sql.MAX), message || '')
      .query(`
        INSERT INTO WholesaleInquiries (CompanyName, ContactPerson, Email, Phone, BusinessType, ExpectedVolume, Message, InquiryDate, Status)
        VALUES (@companyName, @contactPerson, @email, @phone, @businessType, @expectedVolume, @message, GETDATE(), 'pending')
      `);

    return NextResponse.json({
      success: true,
      message: 'Wholesale inquiry submitted successfully. We will contact you within 24 hours.',
    });
  } catch (error) {
    console.error('Submit wholesale inquiry error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit inquiry' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
