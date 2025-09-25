# 🚀 Deployment Guide

This guide will help you deploy the Library Management System to various cloud platforms.

## 📋 Pre-deployment Checklist

- [ ] Remove all sensitive data from code
- [ ] Set up environment variables
- [ ] Test the application locally
- [ ] Prepare production database
- [ ] Update CORS origins for production

## 🗃️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account

2. **Create a Cluster**
   - Choose your cloud provider and region
   - Select the free tier (M0)

3. **Create Database User**
   - Go to Database Access
   - Add a new database user with read/write permissions

4. **Configure Network Access**
   - Go to Network Access
   - Add your IP address (or 0.0.0.0/0 for global access)

5. **Get Connection String**
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

## 🌐 Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URL="your_mongodb_connection_string"
   heroku config:set JWT_USER_PASSWORD="your_user_jwt_secret"
   heroku config:set JWT_ADMIN_PASSWORD="your_admin_jwt_secret"
   heroku config:set NODE_ENV="production"
   heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway add
   ```

3. **Set Environment Variables**
   - Go to Railway dashboard
   - Select your project
   - Go to Variables tab
   - Add all required environment variables

### Option 3: Render

1. **Connect GitHub Repository**
   - Go to [Render](https://render.com)
   - Connect your GitHub account
   - Select your repository

2. **Configure Service**
   - Choose "Web Service"
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables in the Render dashboard

## 💻 Frontend Deployment

### Option 1: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add `REACT_APP_API_URL=https://your-backend-url.com`

### Option 2: Netlify

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

3. **Or Deploy via Dashboard**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `build` folder

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/library-management-system",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Production Configuration

### Environment Variables for Production

```env
# Backend (.env)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/library_management
JWT_USER_PASSWORD=super_secure_secret_key_for_users
JWT_ADMIN_PASSWORD=super_secure_secret_key_for_admins
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Frontend (add to hosting platform)
REACT_APP_API_URL=https://your-backend-domain.com
```

### Security Considerations

1. **Use Strong JWT Secrets**
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Configure CORS Properly**
   ```javascript
   app.use(cors({
       origin: process.env.FRONTEND_URL,
       credentials: true
   }));
   ```

3. **Use HTTPS in Production**
   - Most hosting platforms provide SSL certificates automatically
   - Update all URLs to use HTTPS

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-backend-app"
        heroku_email: "your-email@example.com"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: cd frontend && npm install
    - name: Build
      run: cd frontend && npm run build
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{secrets.VERCEL_TOKEN}}
        vercel-org-id: ${{secrets.ORG_ID}}
        vercel-project-id: ${{secrets.PROJECT_ID}}
        working-directory: ./frontend
```

## 🏥 Health Checks

Add health check endpoints to your backend:

```javascript
// Add to index.js
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

## 📊 Monitoring

1. **Application Monitoring**
   - Use services like Sentry for error tracking
   - Set up logging with Winston

2. **Database Monitoring**
   - MongoDB Atlas provides built-in monitoring
   - Set up alerts for connection issues

3. **Performance Monitoring**
   - Use Lighthouse for frontend performance
   - Monitor API response times

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL environment variable
   - Ensure CORS is configured correctly

2. **Database Connection Issues**
   - Verify MONGO_URL is correct
   - Check IP whitelist in MongoDB Atlas

3. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility

4. **Environment Variables Not Loading**
   - Verify .env file is in root directory
   - Check if variables are set correctly in hosting platform

### Debug Commands

```bash
# Check environment variables
echo $MONGO_URL

# Test database connection
node -e "require('mongoose').connect(process.env.MONGO_URL).then(() => console.log('Connected')).catch(console.error)"

# Check if server is running
curl https://your-backend-url.com/health
```

## 📝 Post-Deployment

1. **Test All Features**
   - User registration/login
   - Book browsing and borrowing
   - Admin functionality

2. **Set Up Monitoring**
   - Error tracking
   - Performance monitoring
   - Uptime monitoring

3. **Configure Backups**
   - Database backups
   - Code repository backups

4. **Documentation**
   - Update API documentation
   - Create user guides

---

**Happy Deploying! 🚀**