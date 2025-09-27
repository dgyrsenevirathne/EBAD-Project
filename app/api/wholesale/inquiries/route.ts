import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, contactPerson, email, phone, businessType, expectedVolume, message } = body;

    const pool = await sql.connect(sqlConfig);
    const requestSql = pool.request();
    requestSql.input('companyName', sql.NVarChar, companyName);
    requestSql.input('contactPerson', sql.NVarChar, contactPerson);
    requestSql.input('email', sql.NVarChar, email);
    requestSql.input('phone', sql.NVarChar, phone);
    requestSql.input('businessType', sql.NVarChar, businessType);
    requestSql.input('expectedVolume', sql.NVarChar, expectedVolume);
    requestSql.input('message', sql.NText, message);

    const query = `
      INSERT INTO WholesaleInquiries (CompanyName, ContactPerson, Email, Phone, BusinessType, ExpectedVolume, Message)
      VALUES (@companyName, @contactPerson, @email, @phone, @businessType, @expectedVolume, @message)
    `;

    await requestSql.query(query);

    await pool.close();

    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit inquiry' }, { status: 500 });
  }
}
