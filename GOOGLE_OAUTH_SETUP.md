# Google OAuth Setup Guide - Complete Step-by-Step

## 🚀 How to Get Google Client ID and Client Secret

### Step 1: Access Google Cloud Console
1. **Open your browser** and go to: https://console.cloud.google.com/
2. **Sign in** with your Google account (use the same account you want to use for your app)

### Step 2: Create or Select a Project
1. **Click the project dropdown** at the top of the page (next to "Google Cloud")
2. **Option A - Create New Project:**
   - Click "New Project"
   - Enter project name: `FishSpotter` (or any name you prefer)
   - Click "Create"
   - Wait for project creation (30-60 seconds)

3. **Option B - Use Existing Project:**
   - Select an existing project from the dropdown

### Step 3: Enable Google OAuth APIs
1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"
   
2. **Enable required APIs:**
   - Search for "Google+ API" → Click it → Click "Enable"
   - Search for "People API" → Click it → Click "Enable" (for user profile info)

### Step 4: Configure OAuth Consent Screen
1. **Go to OAuth consent screen**
   - Left sidebar: "APIs & Services" → "OAuth consent screen"
   
2. **Choose User Type:**
   - Select "External" (for public apps)
   - Click "Create"

3. **Fill OAuth consent screen details:**
   ```
   App name: FishSpotter
   User support email: [your email]
   App logo: [optional - upload your app logo]
   App domain: [leave blank for now]
   Authorized domains: [leave blank for development]
   Developer contact information: [your email]
   ```
   
4. **Click "Save and Continue"**

5. **Scopes step:**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click "Save and Continue"

6. **Test users (for development):**
   - Add your email address as a test user
   - Click "Save and Continue"

### Step 5: Create OAuth 2.0 Credentials
1. **Go to Credentials**
   - Left sidebar: "APIs & Services" → "Credentials"
   
2. **Create credentials:**
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   
3. **Configure OAuth client:**
   ```
   Application type: Web application
   Name: FishSpotter Web Client
   
   Authorized JavaScript origins:
   - http://localhost:3000
   - http://127.0.0.1:3000
   
   Authorized redirect URIs:
   - http://localhost:3000/auth/google/callback
   ```
   
4. **Click "Create"**

### Step 6: Get Your Credentials
1. **Download credentials:**
   - A popup will show your Client ID and Client Secret
   - **IMPORTANT:** Copy these values immediately!
   
2. **Your credentials look like this:**
   ```
   Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
   Client Secret: GOCSPX-abcdefghijklmnopqrstuvwxyz
   ```

### Step 7: Update Your .env File
1. **Open your `.env` file** in the FishSpotter project
2. **Replace the placeholder values:**
   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

### Step 8: Test Your Integration
1. **Save your `.env` file**
2. **Restart your development server:**
   ```bash
   npm run dev
   ```
3. **Open your app:** http://localhost:3000
4. **Click "Get Started"** → **"Continue with Google"**
5. **You should see Google's login page!**

## 🔒 Security Best Practices

### For Development:
- ✅ Keep your `.env` file secure (never commit to GitHub)
- ✅ Only add your email as a test user during development
- ✅ Use `localhost` URLs for testing

### For Production:
1. **Update redirect URIs** in Google Console:
   ```
   https://yourdomain.com/auth/google/callback
   ```
2. **Add your production domain** to authorized origins
3. **Publish your OAuth consent screen** (remove "Testing" status)
4. **Add domain verification** for trusted domains

## 🎯 Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution:** Make sure your redirect URI in Google Console exactly matches:
```
http://localhost:3000/auth/google/callback
```

### Issue: "This app isn't verified"
**Solution:** During development, click "Advanced" → "Go to FishSpotter (unsafe)"

### Issue: "Access blocked: This app's request is invalid"
**Solution:** Check that you've enabled the required APIs (Google+ API, People API)

## 📱 What Happens Next?

Once configured, users will see:
1. **"Continue with Google" button** in your auth modal
2. **Google's secure login page** 
3. **Permission request** for email and profile access
4. **Automatic redirect** back to your app
5. **Instant login** with their Google account info

Your FishSpotter app will automatically:
- ✅ Get user's name and email from Google
- ✅ Create or link their account
- ✅ Log them in securely
- ✅ Redirect to the main app

## 🎉 You're Ready!

Your Google OAuth integration is now complete. Users can sign in with one click using their Google accounts! 🚀
