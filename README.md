# Garden Management Application

## Overview

This is a full-stack garden management application built with Next.js, TailwindCSS, and Supabase.

## Features

- Visual garden map with customizable layouts
- Plant profiles with detailed information
- Vegetable patch planner with drag-and-drop functionality
- User authentication and account management
- Cloud storage for garden layouts and plant data
- Responsive design for desktop and mobile

## Setup

1. Clone the repository
2. Run `npm install`
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run `npm run dev` to start the development server

## Supabase Integration

This application uses Supabase for:
- User authentication (sign up, sign in, sign out)
- Data storage for plants and garden layouts
- Real-time updates when data changes

### Database Schema

The application requires the following tables in your Supabase project:

#### Plants Table
```sql
create table plants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  variety text,
  type text not null,
  color text not null,
  spacing numeric,
  planting_time text,
  harvest_time text,
  growth_stage text,
  care_instructions text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table plants enable row level security;

-- Create policies
create policy "Users can view their own plants" on plants
  for select using (auth.uid() = user_id);

create policy "Users can insert their own plants" on plants
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own plants" on plants
  for update using (auth.uid() = user_id);

create policy "Users can delete their own plants" on plants
  for delete using (auth.uid() = user_id);
```

#### Garden Layouts Table
```sql
create table garden_layouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  rows integer not null,
  columns integer not null,
  grid jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table garden_layouts enable row level security;

-- Create policies
create policy "Users can view their own layouts" on garden_layouts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own layouts" on garden_layouts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own layouts" on garden_layouts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own layouts" on garden_layouts
  for delete using (auth.uid() = user_id);
```

## Project Structure

- `components/`: Reusable React components
- `app/`: Application routes (Next.js App Router)
- `context/`: React context providers for global state management
- `lib/`: Utility functions, types, and Supabase service functions
- `public/`: Static assets
- `styles/`: Global styles and Tailwind configuration

## Development

### Adding New Plants

Plants can be added through the Plants page. Each plant can have the following properties:
- Name
- Variety
- Type (vegetable, fruit, herb, flower, tree)
- Color (for visual identification in the garden planner)
- Spacing requirements
- Planting and harvest times
- Growth stage tracking
- Care instructions

### Creating Garden Layouts

The Vegetable Patch Planner allows users to:
1. Create new garden layouts with customizable dimensions
2. Place plants in the garden grid
3. Visualize plant placement with color coding
4. Save multiple layouts for different garden areas or seasons

## Authentication

The application includes a complete authentication system:
- Sign up with email and password
- Sign in with existing credentials
- User profile management
- Protected routes for authenticated users
