# MetMoMo
 
### 1. Clone the repository
 
```bash
git clone https://github.com/your-username/metmomo.git
cd metmomo
```
 
### 2. Set up the backend
 
```bash
cd server
npm install
```
 
Start the server:
 
```bash
npm run dev
```
 
### 3. Set up the frontend
 
```bash
cd client
npm install
```
 
Create a `.env` file in the `client/` directory:
 
```env
VITE_API_URL=http://localhost:5000
```
 
Add a proxy to `vite.config.js` so `/api` calls reach the backend:
 
```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```
 
Start the frontend:
 
```bash
npm run dev
```
 
The app runs at `http://localhost:5173`.
 
---
## Image Uploads
 
Product and restaurant cover images are uploaded via `multipart/form-data` using Multer on the backend and stored on Cloudinary. The returned URL is saved in MongoDB and served directly to the frontend.
