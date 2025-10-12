-- Database schema for forums functionality
-- Run this SQL in your Supabase dashboard SQL editor

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    course VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_upvotes table
CREATE TABLE IF NOT EXISTS post_upvotes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create post_replies table
CREATE TABLE IF NOT EXISTS post_replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_course ON forum_posts(course);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON post_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_replies_post_id ON post_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_post_replies_created_at ON post_replies(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to forum_posts" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to forum_posts" ON forum_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to forum_posts" ON forum_posts
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to post_upvotes" ON post_upvotes
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to post_upvotes" ON post_upvotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to post_upvotes" ON post_upvotes
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access to post_replies" ON post_replies
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to post_replies" ON post_replies
    FOR INSERT WITH CHECK (true);
