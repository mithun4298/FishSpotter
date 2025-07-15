# Fish ID - AI-Powered Fish Species Identification

## Overview

Fish ID is a full-stack web application that allows users to upload images of fish and receive AI-powered species identification. The application uses Google's Gemini AI to analyze fish images and provide detailed species information including scientific names, common names, habitat details, and conservation status.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom ocean-themed design system
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API**: RESTful API with file upload capabilities using Multer
- **AI Integration**: Google Gemini AI for fish species identification

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **File Storage**: Local file system for temporary image uploads

### Authentication and Authorization
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Express-session with PostgreSQL store
- **Security**: HTTP-only cookies with secure flag for production

## Key Components

### Database Schema
1. **Users Table**: Stores user profile information (required for Replit Auth)
2. **Sessions Table**: Manages user sessions (required for Replit Auth)
3. **Fish Identifications Table**: Stores fish identification results with user associations

### API Endpoints
- `GET /api/auth/user` - Retrieve authenticated user information
- `POST /api/identify-fish` - Upload fish image and get AI identification
- `GET /api/fish-identifications` - Retrieve user's identification history

### Frontend Pages
- **Splash Screen**: Animated loading screen with ocean theme
- **Landing Page**: Public homepage with feature showcase
- **Home Page**: Authenticated user dashboard with batch upload and history
- **Identify Page**: Dedicated fish identification with camera capture and accordion results
- **404 Page**: Custom not found page

### UI Components
- **File Upload**: Drag-and-drop interface with image preview
- **Ocean Theme**: Custom CSS variables and Tailwind configuration
- **Responsive Design**: Mobile-first approach with glass morphism effects

## Data Flow

1. **Authentication Flow**:
   - User clicks login → Redirected to Replit Auth
   - Successful auth → User session created in PostgreSQL
   - Protected routes check authentication status

2. **Fish Identification Flow**:
   - User uploads image → Multer processes file upload
   - Image sent to Google Gemini AI → AI returns species data
   - Results saved to database → Response sent to frontend
   - Frontend displays results and updates history

3. **State Management**:
   - TanStack Query manages API calls and caching
   - Authentication state persisted via HTTP-only cookies
   - UI state managed through React hooks

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM and query builder

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-dropzone**: File upload handling

### Authentication Dependencies
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation
- **express-session**: Session management

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **tsx**: TypeScript execution for backend development
- **Replit Integration**: Development banners and error overlays

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes
- **Environment**: PostgreSQL database provisioned separately

### Configuration
- **Environment Variables**: Database URL, API keys, session secrets
- **Database Migrations**: Schema managed through Drizzle Kit
- **Static Assets**: Served from `dist/public` in production

### Recent Changes (July 15, 2025)

### Fixed File Upload Issues
- **Problem**: File uploads were failing due to incorrect Content-Type headers being set for FormData
- **Solution**: Updated `apiRequest` function in `client/src/lib/queryClient.ts` to properly handle FormData uploads
- **Impact**: Both single and batch fish identification now properly send files to backend

### Added Batch Processing
- **Feature**: Users can now upload up to 10 fish images simultaneously
- **Implementation**: Added `/api/identify-fish-batch` endpoint and enhanced FileUpload component
- **UI**: Tabbed interface allows switching between single and batch upload modes
- **Processing**: Each image in batch is processed individually by Gemini API with comprehensive error handling

### Enhanced Error Handling
- **Backend**: Added detailed logging and error messages for debugging file upload issues
- **Frontend**: Added console logging to track file details and FormData construction
- **User Experience**: Clear error messages for failed uploads and batch processing results

### Added Dedicated Identification Page
- **Feature**: Created focused `/identify` page for streamlined fish identification experience
- **Camera Capture**: Native camera capture with environment camera preference for mobile devices
- **Clean Design**: Deliberately avoided feature cards for focused user experience
- **Accordion Results**: Organized fish information in expandable sections (Basic Info, Habitat, Diet, Conservation)
- **Navigation**: Seamless navigation between Home dashboard and focused identification page
- **Progress Feedback**: Visual loading indicators and progress tracking during AI processing

## Key Design Decisions

1. **Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared code (`shared/`) in single repository for easier development and deployment.

2. **TypeScript Throughout**: Full type safety across frontend, backend, and database schema using Drizzle's type generation.

3. **AI-First Approach**: Google Gemini chosen for advanced image recognition capabilities and detailed biological information.

4. **Ocean Theme**: Custom design system with CSS variables and Tailwind extensions for cohesive underwater aesthetic.

5. **Serverless-Ready**: Neon PostgreSQL and modular architecture designed for easy deployment to serverless platforms.

6. **File Upload Architecture**: FormData handling with proper Content-Type detection for seamless image uploads.