# MySQL Setup Guide

## Step 1: Access MySQL Command Line

After installing MySQL, you need to set up the root password. Here are the options:

### Option A: Using MySQL Command Line (if available in PATH)
```bash
mysql -u root -p
```
If prompted for password, try:
- Empty password (just press Enter)
- `root`
- `admin`
- `password`

### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to localhost:3306
3. Use the default connection or create a new one

### Option C: Find MySQL in Program Files
Look for MySQL in:
- `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`
- `C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe`

## Step 2: Set Root Password

Once you can access MySQL, run:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';
FLUSH PRIVILEGES;
```

## Step 3: Update .env File

Make sure your `.env` file has the correct password:
```
DB_PASSWORD=root123
```

## Step 4: Test Connection

Run the database setup:
```bash
npm run setup-db
```

## Alternative: Create New User

If you can't change root password, create a new user:
```sql
CREATE USER 'security_user'@'localhost' IDENTIFIED BY 'security123';
GRANT ALL PRIVILEGES ON security_web_db.* TO 'security_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```
DB_USER=security_user
DB_PASSWORD=security123
```

## Troubleshooting

1. **Service not running**: Start MySQL service
2. **Access denied**: Check password in .env file
3. **Port issues**: Verify MySQL is on port 3306
4. **PATH issues**: Add MySQL bin directory to system PATH

## Quick Fix Commands

```bash
# Check MySQL service status
Get-Service -Name "*mysql*"

# Start MySQL service (if needed)
net start MySQL80

# Test MySQL connection
mysql -u root -p
``` 