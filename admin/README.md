# Admin Panel

A secure Svelte-based admin panel for managing articles and text items.

## Features

1. **Password Protection**: The admin panel is protected by a URL query parameter. Without the correct password, the panel won't display any content.
2. **Article Management**: View all articles in a table format with title (as hyperlink), category, and delete functionality.
3. **Text Management**: Add and view text items in a simple list format.

## Setup

### 1. Install Dependencies

```bash
cd admin
npm install
```

### 2. Configure Admin Password

Set the admin password in your server's `.env` file:

```env
ADMIN_PASSWORD=your-secure-password-here
```

If not set, the default password is `changeme123` (change this immediately in production!).

### 3. Start the Backend Server

**IMPORTANT**: Make sure your backend server is running before accessing the admin panel!

```bash
cd server
npm run dev
```

The server will run on port 5001 by default (or the port specified in your `.env` file as `PORT`).

### 4. Start the Admin Panel

```bash
cd admin
npm run dev
```

The admin panel will be available at `http://localhost:5174` (or the next available port).

**Note**: If your backend server runs on a different port, create a `.env` file in the `admin` folder with:
```
VITE_API_BASE=http://localhost:YOUR_PORT/api
```

## Usage

### Accessing the Admin Panel

The admin panel uses URL-based password protection. To access it, append the password as a query parameter:

```
http://localhost:5174/?pwd=your-secure-password-here
```

**Important Security Notes:**
- The password is validated on the server side for all API calls
- Without the correct password, the panel shows "Access Denied"
- Even if someone discovers the admin panel URL structure, they cannot access it without the password
- The password should be stored in an environment variable on the server

### Article Management

1. **View Articles**: All articles are displayed in a table with:
   - Title (clickable link to the article)
   - Category
   - Delete button

2. **Delete Article**: 
   - Click the "Delete" button next to any article
   - Confirm the deletion
   - The article will be permanently removed from the database

### Text Management

1. **Add Text**:
   - Type your text in the input box
   - Click "Add Text" or press Enter
   - The text will be added to the list

2. **View Texts**: All added texts are displayed in a scrollable list below the input box.

## API Endpoints

The admin panel uses the following API endpoints (all require password authentication):

- `GET /api/admin/articles?password=<password>` - Get all articles
- `DELETE /api/admin/articles/:key?password=<password>` - Delete an article
- `GET /api/admin/texts?password=<password>` - Get all texts
- `POST /api/admin/texts?password=<password>` - Add a new text

## Configuration

### Environment Variables

The admin panel now supports separate toggles for frontend and backend development modes. Create a `.env` file in the `admin` folder:

```env
# Use Relative API URLs (for nginx proxy - RECOMMENDED for production)
# Set to "true" to use relative URLs like "/api" instead of full URLs
# This allows nginx to handle API routing
VITE_USE_RELATIVE_API=true

# Backend Development Mode
# Set to "true" to use local development backend (localhost:5001/api)
# Set to "false" or leave undefined to use production backend (https://real.sensorcensor.xyz/api)
# NOTE: Ignored when VITE_USE_RELATIVE_API=true
VITE_BACKEND_DEV_MODE=true

# Frontend Development Mode (optional)
# Controls frontend-specific behavior like default passwords
# Set to "true" for development, "false" or undefined for production
VITE_FRONTEND_DEV_MODE=true

# Optional: Override backend URLs
# NOTE: Ignored when VITE_USE_RELATIVE_API=true
VITE_API_BASE_DEV=http://localhost:5001/api
VITE_API_BASE_PROD=https://real.sensorcensor.xyz/api

# Optional: Override client URLs for article links
VITE_CLIENT_URL_DEV=http://localhost:5173
VITE_CLIENT_URL_PROD=https://real.sensorcensor.xyz
```

**Key Points:**
- `VITE_USE_RELATIVE_API=true` (RECOMMENDED for production) - Uses relative URLs (`/api`) for nginx proxy
- `VITE_BACKEND_DEV_MODE` controls which backend API to connect to (local dev vs production) - Ignored if `VITE_USE_RELATIVE_API=true`
- `VITE_FRONTEND_DEV_MODE` controls frontend-specific behavior (like default passwords)
- You can develop the frontend locally while using the production backend by setting `VITE_BACKEND_DEV_MODE=false`
- Default behavior: If `VITE_BACKEND_DEV_MODE` is not set, it defaults to production backend

### Backend API URL

The backend API URL is determined by `VITE_BACKEND_DEV_MODE`:
- `VITE_BACKEND_DEV_MODE=true` → `http://localhost:5001/api`
- `VITE_BACKEND_DEV_MODE=false` or undefined → `https://real.sensorcensor.xyz/api`

### Client Article URLs

The client URL for article links is determined by `VITE_FRONTEND_DEV_MODE`:
- `VITE_FRONTEND_DEV_MODE=true` → `http://localhost:5173` (or `VITE_CLIENT_URL_DEV`)
- `VITE_FRONTEND_DEV_MODE=false` or undefined → `https://real.sensorcensor.xyz` (or `VITE_CLIENT_URL_PROD`)

## Building for Production

```bash
npm run build
```

The built files will be in the `build` directory. Deploy these files to your web server.

## Security Best Practices

1. **Change the Default Password**: Always set a strong password in your `.env` file
2. **Use HTTPS in Production**: Ensure the admin panel is served over HTTPS
3. **Restrict Access**: Consider adding IP whitelisting or additional authentication layers
4. **Monitor Access**: Keep logs of admin panel access
5. **Regular Updates**: Keep dependencies updated for security patches

## Troubleshooting

### "Access Denied" shows even with correct password
- Check that the password in your `.env` file matches what you're using in the URL
- Ensure the server has been restarted after setting the environment variable
- Check server logs for authentication errors

### Articles not loading
- **Most common issue**: Make sure the backend server is running! Start it with `cd server && npm run dev`
- Verify the server is running on the correct port (default is 5001, check `server/src/index.ts`)
- Check `VITE_BACKEND_DEV_MODE` in your `.env` file - if set to `false` or not set, it will try to connect to production backend
- If using local backend, ensure `VITE_BACKEND_DEV_MODE=true` in `admin/.env`
- Check that CORS is properly configured in `server/src/app.ts` (should include admin panel ports)
- Check browser console for detailed error messages
- Verify the `ADMIN_PASSWORD` in your server's `.env` file matches the password in your URL

### Cannot delete articles
- Check server logs for errors
- Verify the article key exists
- Ensure the delete function in `lowdbOperations.ts` is working correctly
