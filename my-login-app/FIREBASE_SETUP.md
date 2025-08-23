# Firebase Setup Guide for Domio

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "domio-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## Step 3: Get Your Firebase Configuration

1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "domio-web")
6. Copy the Firebase configuration object

## Step 4: Update Your Firebase Config

1. Open `src/firebase.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "domionz.firebaseapp.com",
  projectId: "domionz",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "69669184487",
  appId: "1:69669184487:web:e93cf03a2364043db69342"
};
```

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173/signup`
3. Create a new account
4. Try logging in with the created account
5. Test the password reset functionality

## Features Implemented

- ✅ User registration (Landlord/Tenant)
- ✅ User login with email/password
- ✅ Password reset functionality
- ✅ Protected dashboard route
- ✅ User logout
- ✅ Role-based access control

## Security Rules (Optional)

If you want to add Firestore database later, you can set up security rules in the Firebase Console under "Firestore Database" > "Rules".

## Troubleshooting

- Make sure all Firebase services are enabled in your project
- Check the browser console for any error messages
- Verify your Firebase configuration values are correct
- Ensure you're using the correct project ID

## Next Steps

- Add Firestore database for storing user data and properties
- Implement role-based permissions
- Add email verification
- Set up hosting for production deployment


