# User Signup Process

## Overview
When an admin adds a new user to The Bold East Africa platform, the system initiates an invitation-based signup process that involves email verification and account creation.

## Process Flow

### 1. Admin Initiates User Invitation
- **Endpoint**: `POST /api/users/invite`
- **Location**: `backend/app/Http/Controllers/Api/UserController.php::invite()`
- **Data Required**:
  - `name`: User's full name
  - `email`: User's email address
  - `role`: User role (Admin, Editor, Contributor, Viewer)
  - `department`: Optional department
  - `phone`: Optional phone number
  - `bio`: Optional biography
  - `image`: Optional profile image

### 2. System Creates Invitation Record
- **Model**: `UserInvitation` (`backend/app/Models/UserInvitation.php`)
- **Actions**:
  - Generates a 6-digit OTP (One-Time Password)
  - Sets expiration time (24 hours from creation)
  - Stores invitation details in database
  - Links invitation to the inviting admin user

### 3. Invitation Email is Sent
- **Mail Class**: `InvitationMail` (`backend/app/Mail/InvitationMail.php`)
- **Template**: `backend/resources/views/emails/user-invitation.blade.php`
- **Content Includes**:
  - Welcome message with user's name
  - User's email and role information
  - 6-digit OTP prominently displayed
  - Expiration warning (24 hours)
  - Link to accept invitation (`/accept-invitation` - frontend route not yet implemented)
  - Instructions for account setup

### 4. User Receives and Processes Email
- User receives the invitation email
- Email contains the OTP and acceptance instructions
- **Note**: Frontend route `/accept-invitation` is referenced in email but not implemented in the current codebase

### 5. User Accepts Invitation
- **Endpoint**: `POST /api/users/accept-invitation`
- **Location**: `backend/app/Http/Controllers/Api/UserController.php::acceptInvitation()`
- **Data Required**:
  - `email`: User's email
  - `otp`: The 6-digit code from email
  - `password`: New password (min 8 characters)
  - `password_confirmation`: Password confirmation

### 6. System Validates and Creates Account
- **Validation Steps**:
  - Verifies invitation exists and is pending
  - Checks OTP hasn't expired
  - Validates OTP hash against provided code
- **Account Creation**:
  - Creates new `User` record with invitation data
  - Sets status to 'Active'
  - Records invitation acceptance timestamp
  - Links user to inviter

### 7. Welcome Email is Sent
- **Mail Class**: `NewUserWelcome` (`backend/app/Mail/NewUserWelcome.php`)
- **Template**: `backend/resources/views/emails/new-user-welcome.blade.php`
- **Content Includes**:
  - Welcome message
  - Account details (email, role, department)
  - Login instructions
  - Getting started guide
  - Link to platform login

## Database Changes

### UserInvitation Table
- `status`: Changes from 'pending' to 'accepted'
- `accepted_at`: Timestamp when invitation was accepted

### Users Table
- New user record created with:
  - Basic info from invitation
  - Hashed password
  - Status: 'Active'
  - Invitation metadata

## Email Templates

### Invitation Email (`user-invitation.blade.php`)
- Professional design with gradient header
- Clear OTP display in large font
- Expiration warnings
- Step-by-step instructions

### Welcome Email (`new-user-welcome.blade.php`)
- Congratulatory tone
- Account summary
- Next steps guidance
- Security reminders

## Security Considerations
- OTP expires after 24 hours
- Passwords are hashed using Laravel's Hash::make()
- Email validation prevents duplicate invitations
- OTP is hashed for storage (not plain text)

## Current Implementation Status
- **Backend**: Fully implemented
- **Frontend**: Invitation acceptance UI not implemented
- **Email Templates**: Complete and styled
- **API Endpoints**: All endpoints functional

## Missing Frontend Components
- No route for `/accept-invitation`
- No UI component for OTP entry and password setup
- Users may need to manually use API or contact admin for OTP</content>
<parameter name="filePath">/home/ayan/Desktop/projects/the-bold-east-africa-1/user-signup.md