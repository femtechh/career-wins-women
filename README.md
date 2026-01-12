# Career Wins Journal

A production-ready MVP web app designed to help women quickly log career wins and use AI to transform them into powerful career narratives for resumes, performance reviews, and promotions.

## Features

- **Quick Win Logging**: Add career achievements in under 30 seconds
- **AI-Powered Polish**: Transform raw notes into professional content for:
  - Resume bullets
  - Performance review summaries
  - LinkedIn-style posts
- **Smart Export**: Generate comprehensive summaries from selected date ranges
- **Magic Link Auth**: Secure, password-free authentication via email
- **Mobile-First Design**: Optimized for logging wins on the go

## Tech Stack

- **Frontend**: Next.js 13 (App Router) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Soft neutrals with accessible contrast

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

#### Getting Supabase Credentials

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy the "Project URL" to `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the "anon public" key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Getting OpenAI API Key

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create a new API key
4. Copy it to `OPENAI_API_KEY`

### 2. Database Setup

The database schema is already created via Supabase migrations. The `wins` table includes:

- `id`: Unique identifier (UUID)
- `user_id`: Reference to authenticated user
- `text_raw`: Original achievement text
- `text_polished`: AI-enhanced version (nullable)
- `tag`: Category (Work, Leadership, Impact)
- `win_date`: Date of achievement
- `created_at`: Record timestamp

Row Level Security (RLS) policies ensure users can only access their own wins.

### 3. Configure Supabase Auth

1. In your Supabase project, go to Authentication > Providers
2. Enable "Email" provider
3. Configure email templates (optional but recommended):
   - Go to Authentication > Email Templates
   - Customize the "Magic Link" template

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### 6. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── export-wins/      # Export generation endpoint
│   │   └── polish-win/        # AI polish endpoint
│   ├── dashboard/             # Main wins list and add form
│   ├── export/                # Export page with date filters
│   └── login/                 # Magic link authentication
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── add-win-form.tsx       # Form for adding new wins
│   └── win-card.tsx           # Individual win display card
├── lib/
│   ├── supabase/
│   │   └── client.ts          # Supabase client setup
│   ├── auth-context.tsx       # Authentication context provider
│   └── openai.ts              # OpenAI integration functions
└── .env                       # Environment variables (create this)
```

## Usage Guide

### Logging a Win

1. Click "This counts" button on the dashboard
2. Describe your achievement in the text area
3. Optionally select a category (Work, Leadership, Impact)
4. Choose the date (defaults to today)
5. Click "Save win"

### Polishing a Win

Each win card has three polish options:
- **Make resume-ready**: Converts to a concise, action-oriented bullet point
- **Make performance-review ready**: Expands into a comprehensive review statement
- **Make LinkedIn-style**: Transforms into an engaging social media post

Click any button to generate the AI-polished version, which appears below the original text.

### Exporting Wins

1. Navigate to the Export page
2. Select start and end dates
3. Choose format:
   - **Resume bullets**: 5-7 polished achievements
   - **Performance review summary**: Cohesive narrative with themes
4. Click "Generate export"
5. Copy the generated text using the copy button

## Design Principles

- **Minimal & Calm**: Clean interface without gamification or streaks
- **Supportive Language**: Confident, encouraging tone throughout
- **Fast Input**: Designed for quick entry (under 30 seconds)
- **Mobile-First**: Responsive design for on-the-go logging
- **Accessible**: Proper contrast ratios and semantic HTML

## Security

- Row Level Security (RLS) enabled on all database tables
- Users can only access their own data
- Magic link authentication with secure token handling
- API keys stored securely in environment variables
- No passwords to manage or leak

## Contributing

This is an MVP. Future enhancements could include:
- PDF export functionality
- Additional AI polish styles
- Win categories customization
- Search and filtering
- Performance analytics
- Team collaboration features

## License

MIT

## Support

For questions or issues, please create an issue in the repository.
