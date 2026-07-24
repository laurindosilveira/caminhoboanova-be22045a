import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Gift, Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Course } from "./shared";

type Product = {
  id: string;
  name: string;
  description: string | null;
  product_kind: "course" | "bundle";
  course_id: string | null;
  track_id: string | null;
  price_cents: number;
  currency: string;
  display_order: number;
};

type Props = {
  trackId: string;
  courses: Course[];
  institutionalAccess?: boolean;
  onEntitlementsChange: (courseIds: Set<string>) => void;
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function CourseStorefront({ trackId, courses, institutionalAccess = false, onEntitlementsChange }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [entitledIds, setEntitledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const now = new Date().toISOString();
    const [{ data: productRows }, { data: entitlementRows }] = await Promise.all([
      supabase
        .from("course_products" as never)
        .select("id,name,description,product_kind,course_id,track_id,price_cents,currency,display_order")
        .eq("is_active", true)
        .or(`track_id.eq.${trackId},course_id.in.(${courses.map((course) => course.id).join(",")})`)
        .order("display_order"),
      supabase
        .from("user_course_entitlements" as never)
        .select("course_id")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .or(`expires_at.is.null,expires_at.gt.${now}`),
    ]);
    const ids = new Set(((entitlementRows ?? []) as { course_id: string }[]).map((row) => row.course_id));
    setProducts((productRows ?? []) as Product[]);
    setEntitledIds(ids);
    onEntitlementsChange(ids);
    setLoading(false);
  }, [courses, onEntitlementsChange, trackId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("course_checkout");
    if (!result) return;
    if (result === "success") {
      toast.success("Pagamento recebido! Estamos liberando seu acesso.");
      window.setTimeout(() => void load(), 1800);
    } else {
      toast.info("Pagamento cancelado. Nenhuma cobrança foi realizada.");
    }
    params.delete("course_checkout");
    params.delete("session_id");
    window.history.replaceState({}, "", `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`);
  }, [load]);

  const ownedCount = useMemo(
    () => courses.filter((course) => entitledIds.has(course.id)).length,
    [courses, entitledIds],
  );
  const hasAll = courses.length > 0 && ownedCount === courses.length;

  async function buy(product: Product) {
    setBuyingId(product.id);
    const { data, error } = await supabase.functions.invoke("create-course-checkout", {
      body: { productId: product.id },
    });
    setBuyingId(null);
    if (error || !data?.url) {
      toast.error(data?.error || "Não foi possível iniciar o pagamento.");
      return;
    }
    window.location.assign(data.url);
  }

  async function redeem() {
    if (!code.trim()) return toast.error("Digite o código de acesso.");
    setRedeeming(true);
    const { data, error } = await supabase.rpc("redeem_course_access_code" as never, {
      p_code: code.trim().toUpperCase(),
    } as never);
    setRedeeming(false);
    if (error) {
      const messages: Record<string, string> = {
        INVALID_CODE: "Código inválido ou desativado.",
        EXPIRED_CODE: "Este código expirou.",
        CODE_LIMIT_REACHED: "Este código já atingiu o limite de utilizações.",
        CODE_ALREADY_USED: "Você já utilizou este código.",
        CODE_NOT_AVAILABLE_FOR_CHURCH: "Este código não está disponível para sua igreja.",
      };
      const key = Object.keys(messages).find((item) => error.message.includes(item));
      toast.error(key ? messages[key] : "Não foi possível resgatar o código.");
      return;
    }
    const result = data as { product_name?: string; expires_at?: string | null };
    toast.success(`${result.product_name ?? "Acesso"} liberado com sucesso!`);
    setCode("");
    await load();
  }

  if (loading) {
    return <div className="flex justify-center rounded-2xl border bg-card p-6"><Loader2 className="h-5 w-5 animate-spin text-secondary" /></div>;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-secondary/25 bg-gradient-to-b from-secondary/10 to-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <ShoppingBag className="h-5 w-5" />
        </span>
        <div>
          <p className="font-montserrat text-lg font-black text-foreground">Caminho 3M</p>
          <p className="text-xs text-muted-foreground">Escolha um curso ou economize com a jornada completa.</p>
        </div>
      </div>

      {institutionalAccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-brand-green/10 p-4 text-brand-green">
          <BadgeCheck className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold">Acesso institucional liberado</p>
            <p className="text-xs opacity-80">Como líder ou administrador, você pode acessar os cursos sem realizar uma compra.</p>
          </div>
        </div>
      )}

      {hasAll ? (
        <div className="flex items-center gap-3 rounded-2xl bg-brand-green/10 p-4 text-brand-green">
          <BadgeCheck className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold">Jornada completa liberada</p>
            <p className="text-xs opacity-80">Você possui acesso aos três cursos.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => {
            const productCourseIds = product.product_kind === "bundle"
              ? courses.map((course) => course.id)
              : [product.course_id].filter(Boolean) as string[];
            const owned = institutionalAccess || (productCourseIds.length > 0 && productCourseIds.every((id) => entitledIds.has(id)));
            return (
              <div
                key={product.id}
                className={`rounded-2xl border p-4 ${product.product_kind === "bundle" ? "border-secondary bg-secondary/10" : "border-border bg-card"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-montserrat text-sm font-bold text-foreground">{product.name}</p>
                      {product.product_kind === "bundle" && <Sparkles className="h-4 w-4 text-secondary" />}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
                  </div>
                  <p className="shrink-0 font-montserrat text-base font-black text-secondary">{formatPrice(product.price_cents)}</p>
                </div>
                <Button
                  type="button"
                  className="mt-3 w-full rounded-xl"
                  variant={product.product_kind === "bundle" ? "default" : "outline"}
                  disabled={owned || buyingId === product.id}
                  onClick={() => void buy(product)}
                >
                  {buyingId === product.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {institutionalAccess ? "Acesso institucional" : owned ? "Já adquirido" : product.product_kind === "bundle" ? "Comprar jornada completa" : "Comprar curso"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-secondary/40 bg-background/70 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Gift className="h-4 w-4 text-secondary" />
          <p className="text-sm font-bold text-foreground">Tenho um código gratuito</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="DIGITE SEU CÓDIGO"
            className="rounded-xl uppercase"
            disabled={redeeming}
          />
          <Button type="button" className="rounded-xl" onClick={() => void redeem()} disabled={redeeming}>
            {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resgatar"}
          </Button>
        </div>
      </div>
    </section>
  );
}
