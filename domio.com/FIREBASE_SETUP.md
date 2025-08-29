# Firebase Setup for Domio.nz

## Overview
This project has been configured with Firebase for both authentication and data storage.

## Services Configured

### 1. Firebase Authentication
- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Google Authentication**: Users can sign in with their Google account
- **Automatic User Creation**: When users sign up or sign in with Google, their profile is automatically created in Firestore

### 2. Cloud Firestore
- **Users Collection**: Stores user profile data
- **Document Structure**: Each user document contains:
  - `firstName` (string)
  - `lastName` (string)
  - `username` (string)
  - `email` (string)
  - `phone` (string)
  - `role` (string) - "tenant" or "landlord"
  - `about` (string)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

## Files Created/Modified

### New Files:
- `src/firebase/config.js` - Firebase configuration and service initialization
- `src/firebase/auth.js` - Authentication functions (signup, signin, signout)
- `src/firebase/userService.js` - User profile management functions

### Modified Files:
- `src/context/AuthContext.jsx` - Updated to use Firebase authentication and Firestore
- `src/components/Login.jsx` - Integrated with Firebase auth
- `src/components/SignUp.jsx` - Integrated with Firebase auth and Firestore
- `src/components/Profile.jsx` - Integrated with Firestore for profile updates

## Usage

### Authentication
- Users can sign up with email/password or Google
- Users can sign in with email/password or Google
- Authentication state is automatically managed by Firebase

### Profile Management
- User profiles are automatically created upon first signup/signin
- Profile updates are saved to Firestore
- Profile data is automatically loaded when users access the Profile component
- All changes persist between sessions

## Data Flow

### Sign Up Process:
1. User fills out signup form (firstName, lastName, username, phone, role)
2. Firebase Auth account is created
3. User profile document is created in Firestore
4. User is redirected to landing page

### Sign In Process:
1. User authenticates with Firebase
2. User profile data is fetched from Firestore
3. User data is loaded into AuthContext
4. Landing page updates to show user information

### Profile Updates:
1. User modifies profile information
2. Changes are saved to Firestore
3. Profile data persists between sessions

## Next Steps
1. **Firestore Security Rules**: Set up proper security rules in Firebase Console
2. **Storage**: Configure Firebase Storage for profile images
3. **Error Handling**: Add more comprehensive error handling
4. **Loading States**: Improve loading states and user feedback

## Firebase Console Setup Required
1. Enable Authentication with Email/Password and Google providers
2. Create Firestore database in test mode (for development)
3. Set up proper security rules for production

## Testing
To test the setup:
1. Run the development server: `npm run dev`
2. Try signing up with a new email/password
3. Try signing in with Google
4. Update profile information and verify it's saved to Firestore
5. Refresh the page to confirm data persistence

## Security Notes
- Firestore is currently in test mode (open access)
- For production, set up proper security rules
- Consider implementing user data validation
