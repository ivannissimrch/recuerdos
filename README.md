# Recuerdos - Memorias Familiares

A simple, senior-friendly family memory sharing app built to help families reconnect through photos and stories.

**Status:** 🟢 Live and deployed

## About

**Recuerdos** is a warm, accessible platform designed for families to share memories, photos, and stories together. Built with seniors in mind, it features large text, simple navigation, and an intuitive interface that makes it easy for anyone to participate, regardless of tech skills.

### Key Features

- **Share Memories** - Post photos with stories, or stories without photos
- **Comments** - Have conversations around shared memories
- **Reactions** - Show love with simple heart reactions
- **Senior-Friendly Design** - Large text (20px+), big buttons (60px), high contrast
- **Mobile-First** - Designed for phones, where most seniors access the internet
- **Spanish Language** - Fully in Spanish for Spanish-speaking families
- **Pet Memories** - Special category for sharing pet photos and stories

### Categories

- **Niñez** (Childhood) - Share memories from growing up
- **Familia** (Family) - Family gatherings, traditions, celebrations
- **Mascotas** (Pets) - Beloved pets and animal companions
- **Trabajo** (Work) - Career memories and workplace stories
- **Otro** (Other) - Everything else worth remembering

## Purpose

After 27 years of distance, this app was created as a bridge to reconnect with family through shared stories and memories. It removes all technical barriers so that even those unfamiliar with technology can participate in preserving family history together.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Database Schema

### Tables

**memories**

- `id` (UUID, primary key)
- `category` (varchar) - childhood, family, pets, work, other
- `photo_url` (text, nullable)
- `story` (text)
- `author_name` (varchar)
- `created_at` (timestamp)

**comments**

- `id` (UUID, primary key)
- `memory_id` (UUID, foreign key)
- `author_name` (varchar)
- `comment_text` (text)
- `created_at` (timestamp)

**reactions**

- `id` (UUID, primary key)
- `memory_id` (UUID, foreign key)
- `author_name` (varchar)
- `created_at` (timestamp)
- Unique constraint: (memory_id, author_name)

## Design Philosophy

### Accessibility First

- **Large Typography**: 20px body text, 32px headings
- **Big Touch Targets**: Minimum 60px buttons
- **High Contrast**: Dark text on light backgrounds
- **No Auth Barriers**: Simple name-based posting

## Future Enhancements

- Voice recording support
- Video upload capability
- Export to PDF/photo book
- Projects/collections for organizing memories
- AI-powered prompts based on photos

## Built With Love

This app was created to help families stay connected and preserve precious memories together. Every feature was designed with seniors in mind, ensuring that technology never becomes a barrier to sharing love and stories.

---

**Made with love to reconnect families, one memory at a time.**
..
