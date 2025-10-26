# Cresp Setup Guide

## Complete Custom Authentication System

This project now uses a custom JWT-based authentication system with email/password login, replacing NextAuth.js and Google OAuth.

## Features

✅ **Email & Password Authentication**
- User registration with username, email, and password
- Email verification required before login
- Password reset functionality
- JWT sessions (7-day expiry)

✅ **Security**
- Passwords hashed with bcrypt (12 salt rounds)
- Secure JWT tokens
- Email verification tokens
- Password reset tokens with 1-hour expiry
- Username validation (8+ chars, alphanumeric, `-` and `_` only)

✅ **SendGrid Email Integration**
- Verification emails
- Password reset emails
- Welcome emails

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and update your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cresp"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-generated-secret-here"

# SendGrid
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# App URL
NEXTAUTH_URL="http://localhost:3000"  # Change to your production URL in prod
```

### 3. Generate JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Set Up SendGrid

1. Create account at [SendGrid](https://sendgrid.com)
2. Verify your sender email/domain
3. Create API key with "Mail Send" permissions
4. Add to `.env` file

**Free Tier:** 100 emails/day (perfect for development)

### 5. Run Database Migrations

```bash
# Push schema to database
npm run db:push

# Or create migration
npx prisma migrate dev --name init
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://user:pass@localhost:5432/cresp` |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ | (32+ random characters) |
| `SENDGRID_API_KEY` | SendGrid API key | ✅ | `SG.xxxxxx` |
| `FROM_EMAIL` | Verified sender email | ✅ | `noreply@yourdomain.com` |
| `NEXTAUTH_URL` | App URL | ✅ | `http://localhost:3000` |

## Authentication Flow

### Sign Up
1. User provides username, email, password
2. System validates input (username 8+ chars, password requirements)
3. Password is hashed with bcrypt
4. Verification token generated
5. User created in database (isVerified = false)
6. Verification email sent via SendGrid
7. User clicks link in email
8. Account verified → can now log in

### Login
1. User provides email & password
2. System verifies credentials
3. Checks if email is verified
4. Generates JWT token (7-day expiry)
5. Sets HTTP-only cookie
6. Redirects to journey (first time) or feed

### Password Reset
1. User requests password reset
2. Reset token generated (1-hour expiry)
3. Reset email sent
4. User clicks link and enters new password
5. Password updated, token cleared

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout (clear cookie)
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## Pages

### Public (No Auth Required)
- `/login` - Login page
- `/signup` - Registration page
- `/verify-email` - Email verification page
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password form

### Protected (Auth Required)
- `/journey` - Onboarding (first-time users)
- `/feed` - Main feed
- `/discover` - Discover creatives
- `/collaborations` - Collaboration projects
- `/messages` - Direct messages

## Database Schema

### User Model
```prisma
model User {
    id                   String    @id @default(cuid())
    username             String    @unique
    email                String    @unique
    password             String    // bcrypt hashed
    name                 String?
    image                String?
    bio                  String?
    roles                String[]  @default([])
    location             String?
    isVerified           Boolean   @default(false)
    verificationToken    String?   @unique
    resetPasswordToken   String?   @unique
    resetPasswordExpires DateTime?
    onboardingCompleted  Boolean   @default(false)
    createdAt            DateTime  @default(now())
    updatedAt            DateTime  @updatedAt
    posts                Post[]
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Username Requirements

- Minimum 8 characters
- Maximum 30 characters
- Must start with a letter
- Only letters, numbers, hyphens (-), and underscores (_)
- No spaces

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Complete custom auth setup"
git push origin main
```

2. **Deploy to Vercel**
- Import project from GitHub
- Add environment variables in Vercel dashboard
- Deploy

3. **Environment Variables for Production**
```env
DATABASE_URL="your-production-db-url"
JWT_SECRET="same-or-different-secret"
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@yourdomain.com"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

4. **Run Migrations**
```bash
npx prisma migrate deploy
```

## Email Templates

The system sends beautiful HTML emails for:
- **Verification** - Welcome and verify email
- **Password Reset** - Secure reset link
- **Welcome** - After verification success

All emails are branded with Cresp colors and responsive design.

## Security Best Practices

✅ Passwords are hashed with bcrypt (never stored plain text)
✅ JWT tokens stored in HTTP-only cookies
✅ Email verification required before login
✅ Password reset tokens expire in 1 hour
✅ Verification tokens expire in 24 hours
✅ JWT sessions expire in 7 days
✅ Input validation with Zod
✅ Protection against email enumeration

## Troubleshooting

### "Invalid or expired verification token"
- Token may have expired (24 hours)
- Request a new verification email

### "Please verify your email before logging in"
- Check your email inbox (and spam folder)
- Click the verification link
- If expired, contact support for new link

### Emails not sending
- Verify SendGrid API key is correct
- Check sender email is verified in SendGrid
- Review SendGrid activity dashboard
- Check free tier limits (100/day)

### JWT errors
- Ensure `JWT_SECRET` is set in `.env`
- Secret should be 32+ characters
- Same secret must be used across all instances

## Next Steps

1. ✅ Authentication is complete
2. 📝 Update onboarding flow with new user data
3. 🎨 Add profile editing functionality
4. 📧 Add resend verification email feature
5. 👥 Build out social features
6. 🔔 Add notifications
7. 📱 Enhance PWA features

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check server logs
4. Verify all environment variables are set

---

**Built with:** Next.js 15, Prisma, PostgreSQL, SendGrid, JWT, bcrypt

