-- Function to check member limits before inserting/updating profiles
CREATE OR REPLACE FUNCTION public.check_church_member_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_member_limit INTEGER;
    v_current_count INTEGER;
    v_subscription_status TEXT;
    v_church_id UUID;
BEGIN
    -- Get the church_id for the profile
    v_church_id := NEW.church_id;
    
    -- If church_id is null, we don't enforce limits (might be a global user or super admin)
    IF v_church_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get subscription info
    SELECT member_limit, subscription_status 
    INTO v_member_limit, v_subscription_status
    FROM public.church_subscriptions
    WHERE church_id = v_church_id
    LIMIT 1;

    -- If no subscription found, default to blocked (must have subscription to have members)
    IF v_subscription_status IS NULL THEN
        RAISE EXCEPTION 'Church has no subscription record.';
    END IF;

    -- Block if subscription is blocked or past_due/unpaid (optional: could allow grace period)
    IF v_subscription_status IN ('blocked', 'canceled') THEN
        RAISE EXCEPTION 'Church subscription is %.', v_subscription_status;
    END IF;

    -- If limit is null, it means unlimited (Pastoral plan)
    IF v_member_limit IS NULL THEN
        RETURN NEW;
    END IF;

    -- Count existing members
    SELECT count(*) INTO v_current_count
    FROM public.profiles
    WHERE church_id = v_church_id;

    -- If inserting new member, check if it exceeds limit
    IF (TG_OP = 'INSERT') AND (v_current_count >= v_member_limit) THEN
        RAISE EXCEPTION 'Member limit reached for this church (%/%). Upgrade your plan to add more members.', v_current_count, v_member_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS tr_check_member_limit ON public.profiles;
CREATE TRIGGER tr_check_member_limit
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_church_member_limit();

-- Helper function to simulate/test webhook processing
CREATE OR REPLACE FUNCTION public.test_stripe_webhook(
    p_church_subscription_id UUID,
    p_event_type TEXT,
    p_stripe_status TEXT DEFAULT 'active'
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- This is a helper for developers to simulate status changes
    -- In a real scenario, this would be done via Edge Function
    -- Here we update the table directly to test UI reactivity
    
    UPDATE public.church_subscriptions
    SET 
        subscription_status = p_stripe_status,
        updated_at = now(),
        last_webhook_event_id = 'test_' || floor(random() * 1000000)::text
    WHERE id = p_church_subscription_id;
    
    INSERT INTO public.stripe_webhook_logs (
        event_id,
        event_type,
        payload,
        church_subscription_id,
        status
    ) VALUES (
        'test_' || floor(random() * 1000000)::text,
        p_event_type,
        jsonb_build_object('test', true, 'simulated_status', p_stripe_status),
        p_church_subscription_id,
        'processed'
    );

    RETURN jsonb_build_object('success', true, 'new_status', p_stripe_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
