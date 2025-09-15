import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { id, firstName, lastName, addressLine1, addressLine2, city, province, postalCode, isDefault } = await request.json();

    const pool = await sql.connect(sqlConfig);

    if (id) {
      // Update existing address
      await pool.request()
        .input('addressID', sql.Int, id)
        .input('userID', sql.Int, user.UserID)
        .input('firstName', sql.NVarChar, firstName)
        .input('lastName', sql.NVarChar, lastName)
        .input('addressLine1', sql.NVarChar, addressLine1)
        .input('addressLine2', sql.NVarChar, addressLine2 || null)
        .input('city', sql.NVarChar, city)
        .input('province', sql.NVarChar, province)
        .input('postalCode', sql.NVarChar, postalCode || null)
        .query(`
          UPDATE Addresses
          SET FirstName = @firstName, LastName = @lastName, AddressLine1 = @addressLine1, AddressLine2 = @addressLine2,
              City = @city, Province = @province, PostalCode = @postalCode
          WHERE AddressID = @addressID AND UserID = @userID
        `);
    } else {
      // Add new address
      if (isDefault) {
        // Set all other addresses to not default
        await pool.request()
          .input('userID', sql.Int, user.UserID)
          .query(`
            UPDATE Addresses
            SET IsDefault = 0
            WHERE UserID = @userID
          `);
      }

      await pool.request()
        .input('userID', sql.Int, user.UserID)
        .input('firstName', sql.NVarChar, firstName)
        .input('lastName', sql.NVarChar, lastName)
        .input('addressLine1', sql.NVarChar, addressLine1)
        .input('addressLine2', sql.NVarChar, addressLine2 || null)
        .input('city', sql.NVarChar, city)
        .input('province', sql.NVarChar, province)
        .input('postalCode', sql.NVarChar, postalCode || null)
        .input('isDefault', sql.Bit, isDefault ? 1 : 0)
        .query(`
          INSERT INTO Addresses (UserID, FirstName, LastName, AddressLine1, AddressLine2, City, Province, PostalCode, IsDefault)
          VALUES (@userID, @firstName, @lastName, @addressLine1, @addressLine2, @city, @province, @postalCode, @isDefault)
        `);
    }

    return NextResponse.json({
      success: true,
      message: id ? 'Address updated successfully' : 'Address added successfully',
    });

  } catch (error) {
    console.error('Address save error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
