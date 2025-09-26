-- Create try_on_sessions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='try_on_sessions' AND xtype='U')
BEGIN
    CREATE TABLE try_on_sessions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        user_image_path NVARCHAR(500) NOT NULL,
        result_image_path NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'processing',
        customizations NVARCHAR(MAX) NULL, -- JSON string
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(UserID),
        FOREIGN KEY (product_id) REFERENCES products(ProductID)
    );

    -- Add indexes for better performance
    CREATE INDEX IX_try_on_sessions_user_id ON try_on_sessions(user_id);
    CREATE INDEX IX_try_on_sessions_status ON try_on_sessions(status);
    CREATE INDEX IX_try_on_sessions_created_at ON try_on_sessions(created_at);
END
