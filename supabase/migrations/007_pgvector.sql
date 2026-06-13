-- =========================================================
-- SideQuest — Migration 007: pgvector for RAG
-- Run in Supabase SQL Editor (fresh tab)
-- =========================================================

-- Enable the pgvector extension
create extension if not exists vector;

-- Add embedding column to quests (voyage-3-lite = 512 dimensions)
alter table public.quests
  add column if not exists embedding vector(512);

-- IVFFlat index for fast approximate nearest-neighbour search
-- lists = ceil(sqrt(total_rows)) — safe starting point for 50–500 rows
create index if not exists quests_embedding_idx
  on public.quests
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- ── Semantic similarity search function ──────────────────

create or replace function match_quests(
  query_embedding   vector(512),
  match_threshold   float    default 0.4,
  match_count       int      default 8,
  p_personality     text     default 'all',
  p_age             int      default 25,
  p_budget_tier     int      default 4,
  p_fitness_level   int      default 5
)
returns table (
  id               uuid,
  title            text,
  description      text,
  category         text,
  tier             text,
  xp_reward        int,
  duration_minutes int,
  cost_min         int,
  cost_max         int,
  tags             text[],
  info             jsonb,
  similarity       float
)
language plpgsql as $$
begin
  return query
  select
    q.id,
    q.title,
    q.description,
    q.category,
    q.tier,
    q.xp_reward,
    q.duration_minutes,
    q.cost_min,
    q.cost_max,
    q.tags,
    q.info,
    1 - (q.embedding <=> query_embedding) as similarity
  from public.quests q
  where q.is_active = true
    and q.embedding is not null
    and q.min_age   <= p_age
    and q.max_age   >= p_age
    and q.budget_tier      <= p_budget_tier
    and q.fitness_required <= p_fitness_level
    and (q.personality_match = 'all' or q.personality_match = p_personality)
    and (1 - (q.embedding <=> query_embedding)) > match_threshold
  order by q.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Grant execute to authenticated users
grant execute on function match_quests to authenticated;
