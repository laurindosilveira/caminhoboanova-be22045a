-- Venda avulsa dos cursos Caminho 3M, acessos individuais e códigos promocionais.

CREATE TABLE IF NOT EXISTS public.course_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  product_kind text NOT NULL CHECK (product_kind IN ('course', 'bundle')),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.learning_tracks(id) ON DELETE CASCADE,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'brl',
  stripe_product_id text UNIQUE,
  stripe_price_id text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (product_kind = 'course' AND course_id IS NOT NULL)
    OR (product_kind = 'bundle' AND track_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.course_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.course_products(id),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'brl',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded', 'canceled')),
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_course_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('purchase', 'access_code', 'admin')),
  order_id uuid REFERENCES public.course_orders(id) ON DELETE SET NULL,
  access_code_id uuid,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, source, order_id, access_code_id)
);

CREATE TABLE IF NOT EXISTS public.course_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.course_products(id) ON DELETE CASCADE,
  church_id uuid REFERENCES public.churches(id) ON DELETE CASCADE,
  duration_months integer CHECK (duration_months IS NULL OR duration_months > 0),
  redeemable_until timestamptz,
  max_redemptions integer CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  redemption_count integer NOT NULL DEFAULT 0 CHECK (redemption_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_course_entitlements
  DROP CONSTRAINT IF EXISTS user_course_entitlements_access_code_id_fkey;
ALTER TABLE public.user_course_entitlements
  ADD CONSTRAINT user_course_entitlements_access_code_id_fkey
  FOREIGN KEY (access_code_id) REFERENCES public.course_access_codes(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.course_access_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id uuid NOT NULL REFERENCES public.course_access_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (access_code_id, user_id)
);

CREATE INDEX IF NOT EXISTS course_orders_user_status_idx
  ON public.course_orders(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS user_course_entitlements_active_idx
  ON public.user_course_entitlements(user_id, course_id, expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS course_access_codes_active_idx
  ON public.course_access_codes(is_active, redeemable_until);

ALTER TABLE public.course_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_access_code_redemptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.course_products TO authenticated;
GRANT SELECT, INSERT ON public.course_orders TO authenticated;
GRANT SELECT ON public.user_course_entitlements TO authenticated;
GRANT SELECT ON public.course_access_codes TO authenticated;
GRANT SELECT ON public.course_access_code_redemptions TO authenticated;

CREATE POLICY course_products_read_active ON public.course_products
  FOR SELECT TO authenticated
  USING (is_active OR public.is_super_admin((SELECT auth.uid())));
CREATE POLICY course_products_system_admin ON public.course_products
  FOR ALL TO authenticated
  USING (public.is_super_admin((SELECT auth.uid())))
  WITH CHECK (public.is_super_admin((SELECT auth.uid())));

CREATE POLICY course_orders_read_own ON public.course_orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_super_admin((SELECT auth.uid())));
CREATE POLICY course_orders_insert_own ON public.course_orders
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND status = 'pending');
CREATE POLICY course_orders_system_admin ON public.course_orders
  FOR ALL TO authenticated
  USING (public.is_super_admin((SELECT auth.uid())))
  WITH CHECK (public.is_super_admin((SELECT auth.uid())));

CREATE POLICY course_entitlements_read_own ON public.user_course_entitlements
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_super_admin((SELECT auth.uid())));
CREATE POLICY course_entitlements_system_admin ON public.user_course_entitlements
  FOR ALL TO authenticated
  USING (public.is_super_admin((SELECT auth.uid())))
  WITH CHECK (public.is_super_admin((SELECT auth.uid())));

CREATE POLICY course_codes_system_admin ON public.course_access_codes
  FOR ALL TO authenticated
  USING (public.is_super_admin((SELECT auth.uid())))
  WITH CHECK (public.is_super_admin((SELECT auth.uid())));

CREATE POLICY course_redemptions_read_own ON public.course_access_code_redemptions
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_super_admin((SELECT auth.uid())));
CREATE POLICY course_redemptions_system_admin ON public.course_access_code_redemptions
  FOR ALL TO authenticated
  USING (public.is_super_admin((SELECT auth.uid())))
  WITH CHECK (public.is_super_admin((SELECT auth.uid())));

CREATE OR REPLACE FUNCTION public.redeem_course_access_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_church_id uuid;
  v_code public.course_access_codes%ROWTYPE;
  v_product public.course_products%ROWTYPE;
  v_course_id uuid;
  v_expires_at timestamptz;
  v_granted integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT church_id INTO v_user_church_id
  FROM public.profiles
  WHERE user_id = v_user_id;

  SELECT * INTO v_code
  FROM public.course_access_codes
  WHERE code = upper(trim(p_code))
  FOR UPDATE;

  IF v_code.id IS NULL OR NOT v_code.is_active THEN
    RAISE EXCEPTION 'INVALID_CODE';
  END IF;
  IF v_code.redeemable_until IS NOT NULL AND v_code.redeemable_until < now() THEN
    RAISE EXCEPTION 'EXPIRED_CODE';
  END IF;
  IF v_code.max_redemptions IS NOT NULL AND v_code.redemption_count >= v_code.max_redemptions THEN
    RAISE EXCEPTION 'CODE_LIMIT_REACHED';
  END IF;
  IF v_code.church_id IS NOT NULL AND v_code.church_id IS DISTINCT FROM v_user_church_id THEN
    RAISE EXCEPTION 'CODE_NOT_AVAILABLE_FOR_CHURCH';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.course_access_code_redemptions
    WHERE access_code_id = v_code.id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'CODE_ALREADY_USED';
  END IF;

  SELECT * INTO v_product FROM public.course_products WHERE id = v_code.product_id AND is_active;
  IF v_product.id IS NULL THEN
    RAISE EXCEPTION 'PRODUCT_NOT_AVAILABLE';
  END IF;

  v_expires_at := CASE
    WHEN v_code.duration_months IS NULL THEN NULL
    ELSE now() + make_interval(months => v_code.duration_months)
  END;

  FOR v_course_id IN
    SELECT c.id
    FROM public.courses c
    WHERE (v_product.product_kind = 'course' AND c.id = v_product.course_id)
       OR (v_product.product_kind = 'bundle' AND c.track_id = v_product.track_id)
  LOOP
    INSERT INTO public.user_course_entitlements (
      user_id, course_id, source, access_code_id, starts_at, expires_at
    )
    VALUES (v_user_id, v_course_id, 'access_code', v_code.id, now(), v_expires_at)
    ON CONFLICT DO NOTHING;
    v_granted := v_granted + 1;
  END LOOP;

  INSERT INTO public.course_access_code_redemptions (access_code_id, user_id, expires_at)
  VALUES (v_code.id, v_user_id, v_expires_at);

  UPDATE public.course_access_codes
  SET redemption_count = redemption_count + 1
  WHERE id = v_code.id;

  RETURN jsonb_build_object(
    'success', true,
    'product_name', v_product.name,
    'courses_granted', v_granted,
    'expires_at', v_expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_course_access_code(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_course_access_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_course_access_code(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_access_course_content(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN (SELECT auth.uid()) IS NULL THEN false
    WHEN NOT EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = p_course_id
        AND track_id = '3a000000-0000-4000-8000-000000000001'
    ) THEN true
    WHEN public.is_super_admin((SELECT auth.uid())) THEN true
    WHEN EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.track_church_releases r
        ON r.church_id = p.church_id
       AND r.track_id = '3a000000-0000-4000-8000-000000000001'
      WHERE p.user_id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'lider'::public.app_role)
    ) THEN true
    ELSE EXISTS (
      SELECT 1
      FROM public.user_course_entitlements e
      WHERE e.user_id = (SELECT auth.uid())
        AND e.course_id = p_course_id
        AND e.starts_at <= now()
        AND e.revoked_at IS NULL
        AND (e.expires_at IS NULL OR e.expires_at > now())
    )
  END
$$;

REVOKE ALL ON FUNCTION public.can_access_course_content(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_access_course_content(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_access_course_content(uuid) TO authenticated;

-- Protege o conteúdo integral dos cursos pagos mesmo contra consultas diretas à API.
DROP POLICY IF EXISTS "Lesson content is viewable by own church or official" ON public.lesson_content;
CREATE POLICY "Lesson content is viewable by own church or official"
ON public.lesson_content FOR SELECT TO authenticated
USING (
  (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin((SELECT auth.uid())))
  AND EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = lesson_content.lesson_id
      AND public.can_access_course_content(l.course_id)
  )
);

DROP POLICY IF EXISTS "Devotional content is viewable by own church or official" ON public.devotional_content;
CREATE POLICY "Devotional content is viewable by own church or official"
ON public.devotional_content FOR SELECT TO authenticated
USING (
  (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin((SELECT auth.uid())))
  AND (
    lesson_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = devotional_content.lesson_id
        AND public.can_access_course_content(l.course_id)
    )
  )
);

-- Catálogo inicial Caminho 3M.
INSERT INTO public.course_products (
  id, slug, name, description, product_kind, course_id, track_id, price_cents, display_order
)
VALUES
  ('3b100000-0000-4000-8000-000000000001', 'enraizados-no-evangelho',
   'Enraizados no Evangelho', 'Encontre seu lugar na história de Deus.',
   'course', '3a100000-0000-4000-8000-000000000001', NULL, 1500, 1),
  ('3b200000-0000-4000-8000-000000000001', 'as-3-marcas-do-discipulo',
   'As 3 Marcas do Discípulo', 'Amar a Deus, amar ao próximo e servir ao mundo.',
   'course', '3a200000-0000-4000-8000-000000000001', NULL, 2500, 2),
  ('3b300000-0000-4000-8000-000000000001', 'as-3-marcas-do-discipulado',
   'As 3 Marcas do Discipulado', 'Formando e multiplicando discípulos de Jesus.',
   'course', '3a300000-0000-4000-8000-000000000001', NULL, 2500, 3),
  ('3b400000-0000-4000-8000-000000000001', 'caminho-3m-completo',
   'Caminho 3M Completo', 'Os três cursos da jornada Caminho 3M com valor especial.',
   'bundle', NULL, '3a000000-0000-4000-8000-000000000001', 5000, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  is_active = true,
  display_order = EXCLUDED.display_order;

-- Cinco códigos gratuitos iniciais. Cada um libera o pacote por 3 meses e pode ser usado uma vez.
INSERT INTO public.course_access_codes (
  code, name, product_id, duration_months, max_redemptions, is_active
)
VALUES
  ('3M-GRATIS-01-A7K9', 'Cortesia Caminho 3M 01', '3b400000-0000-4000-8000-000000000001', 3, 1, true),
  ('3M-GRATIS-02-M4P8', 'Cortesia Caminho 3M 02', '3b400000-0000-4000-8000-000000000001', 3, 1, true),
  ('3M-GRATIS-03-R6T2', 'Cortesia Caminho 3M 03', '3b400000-0000-4000-8000-000000000001', 3, 1, true),
  ('3M-GRATIS-04-V9C5', 'Cortesia Caminho 3M 04', '3b400000-0000-4000-8000-000000000001', 3, 1, true),
  ('3M-GRATIS-05-X2N7', 'Cortesia Caminho 3M 05', '3b400000-0000-4000-8000-000000000001', 3, 1, true)
ON CONFLICT (code) DO NOTHING;
