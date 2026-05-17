-- Add member_limit and church_id to church_subscriptions
ALTER TABLE public.church_subscriptions 
ADD COLUMN IF NOT EXISTS member_limit INTEGER,
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);

-- Update church_subscriptions status to include active, past_due, canceled, blocked
-- This is just for documentation as it's a text column, but good to have in mind.

-- Create index for faster lookups by stripe IDs
CREATE INDEX IF NOT EXISTS idx_church_subscriptions_stripe_customer ON public.church_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_church_subscriptions_stripe_subscription ON public.church_subscriptions(stripe_subscription_id);
