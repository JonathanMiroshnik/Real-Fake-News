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

### Backend API URL

If your backend runs on a different URL or port, create a `.env` file in the `admin` folder:

```env
VITE_API_BASE=http://localhost:5001/api
```

The default is `http://localhost:5001/api` (note: the server defaults to port 5001, not 5000).

### Client Article URLs

If your main client application runs on a different URL, update the `getArticleUrl` function in `src/routes/+page.svelte`:

```typescript
const clientUrl = 'http://localhost:5173'; // Change to your production URL
```

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
- If your backend runs on a different port, set `VITE_API_BASE` in `admin/.env`
- Check that CORS is properly configured in `server/src/app.ts` (should include admin panel ports)
- Check browser console for detailed error messages
- Verify the `ADMIN_PASSWORD` in your server's `.env` file matches the password in your URL

### Cannot delete articles
- Check server logs for errors
- Verify the article key exists
- Ensure the delete function in `lowdbOperations.ts` is working correctly
