import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'
import { sqlConfig } from '@/config/database'

export async function GET(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null
  const maxRetries = 3
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pool = await sql.connect(sqlConfig)

      const { searchParams } = new URL(request.url)
      const festival = searchParams.get('festival')
      const cartProductIdsParam = searchParams.get('cartProductIds')
      const cartProductIds = cartProductIdsParam ? cartProductIdsParam.split(',').map(Number).filter(id => !isNaN(id)) : []

      if (!festival) {
        return NextResponse.json({ success: false, message: 'Festival parameter is required' }, { status: 400 })
      }

      const requestObj = pool.request()
      requestObj.input('festival', sql.NVarChar(50), festival)

      let whereConditions = ['p.IsActive = 1', 'p.Festival = @festival']
      let notInClause = ''

      if (cartProductIds.length > 0) {
        const idParams = cartProductIds.map((_, index) => `@cartId${index}`)
        notInClause = `AND p.ProductID NOT IN (${idParams.join(',')})`
        cartProductIds.forEach((id, index) => {
          requestObj.input(`cartId${index}`, sql.Int, id)
        })
      }

      // Add stock condition
      whereConditions.push('(SELECT ISNULL(SUM(pv.Stock), 0) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) > 0')

      const query = `
        SELECT
          p.ProductID,
          p.ProductName,
          p.Description,
          p.BasePrice,
          COALESCE(pi.ImageURL, '/placeholder.svg') as PrimaryImage,
          p.Festival,
          p.IsFeatured,
          (SELECT ISNULL(SUM(pv.Stock), 0) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as TotalStock
        FROM Products p
        LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
        WHERE ${whereConditions.join(' AND ')} ${notInClause}
        ORDER BY p.IsFeatured DESC, p.BasePrice ASC
        OFFSET 0 ROWS
        FETCH NEXT 10 ROWS ONLY
      `

      const result = await requestObj.query(query)

      return NextResponse.json({ success: true, data: result.recordset })

    } catch (error) {
      console.error(`Get festival bundles error (attempt ${attempt}/${maxRetries}):`, error)
      lastError = error

      if (pool) {
        try {
          await pool.close()
        } catch (closeError) {
          console.error('Error closing pool:', closeError)
        }
        pool = null
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  console.error('All retry attempts failed:', lastError)
  return NextResponse.json({ success: false, message: 'Failed to fetch festival products after multiple attempts' }, { status: 500 })
}
