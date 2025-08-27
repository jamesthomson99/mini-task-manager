# Task Manager Demo App

A full-stack task management application built with Next.js, FastAPI, and Supabase. This project demonstrates a modern monorepo structure with a React frontend and Python backend.

## Features

- **User Authentication**: Register, login, and logout functionality
- **Task Management**: Create, read, update, delete, and toggle task completion
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Database**: PostgreSQL database powered by Supabase
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and settings management
- **Supabase** - PostgreSQL database with real-time features
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

## Project Structure

```
mini-task-manager/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── routers/         # API route handlers
│   │   ├── database.py      # Database configuration
│   │   └── models.py        # Pydantic models
│   ├── main.py              # FastAPI application entry point
│   └── requirements.txt
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and service role key
3. Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR NOT NULL,
  hashed_password VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Environment Configuration

#### Backend (.env file in backend directory)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET_KEY=your-secret-key-here
```

#### Frontend (.env.local file in frontend directory)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run the Application

#### Start the Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Start the Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks/` - Get all tasks for current user
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{task_id}` - Get specific task
- `PUT /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task
- `PATCH /api/tasks/{task_id}/toggle` - Toggle task completion status

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Create Tasks**: Click "Add Task" to create new tasks with title and description
3. **Manage Tasks**:
   - Check/uncheck tasks to mark as complete/incomplete
   - Click the edit icon to modify task details
   - Click the trash icon to delete tasks
4. **Logout**: Click the logout button to sign out

## Development

### Frontend Development
- The frontend uses Next.js App Router
- Components are built with shadcn/ui for consistency
- State management is handled with React Context
- API calls are centralized in the `apiClient`

### Backend Development
- FastAPI provides automatic API documentation
- Pydantic models ensure data validation
- JWT tokens handle authentication
- Supabase client manages database operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
