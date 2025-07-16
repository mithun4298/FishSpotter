# Quick Visual Guide - Google OAuth Setup

## 🎯 TL;DR - Get Your Credentials in 5 Minutes

### 1. Go to Google Cloud Console
```
🌐 https://console.cloud.google.com/
```

### 2. Create Project (if needed)
```
📁 Click "Select a project" → "New Project" → Name: "FishSpotter" → "Create"
```

### 3. Enable APIs
```
🔧 APIs & Services → Library → Search "Google+ API" → Enable
🔧 APIs & Services → Library → Search "People API" → Enable
```

### 4. OAuth Consent Screen
```
🛡️ APIs & Services → OAuth consent screen → External → Create
📝 App name: "FishSpotter"
📧 User support email: your@email.com
📧 Developer contact: your@email.com
→ Save and Continue → Save and Continue → Save and Continue
```

### 5. Create Credentials
```
🔑 APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client IDs
📱 Application type: Web application
📝 Name: "FishSpotter Web Client"
🌐 Authorized JavaScript origins: http://localhost:3000
🔄 Authorized redirect URIs: http://localhost:3000/auth/google/callback
→ Create
```

### 6. Copy Your Credentials
```
✅ You'll see a popup with:
   Client ID: 123456789-abc...apps.googleusercontent.com
   Client Secret: GOCSPX-xyz...
```

### 7. Update .env File
```env
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 8. Test It!
```bash
npm run dev
```
Go to http://localhost:3000 → Click "Get Started" → "Continue with Google" 🎉

## 🚨 Important Notes

- **Client ID** always ends with `.apps.googleusercontent.com`
- **Client Secret** always starts with `GOCSPX-`
- **Never commit your real credentials** to GitHub
- **Add your email as a test user** during development

## 🎯 What You'll See

1. **Before setup:** Placeholder values in .env
2. **After setup:** Working "Continue with Google" button
3. **Working flow:** Click → Google login → Back to your app → Logged in!

Your Google OAuth is ready when the "Continue with Google" button redirects to Google's login page! 🚀
