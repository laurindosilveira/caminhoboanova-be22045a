import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Gift, Loader2, Plus, Power, RefreshCw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Product = {
  id: string;
  name: string;
  price_cents: number;
  stripe_price_id: string | null;
};

type AccessCode = {
  id: string;
  code: string;
  name: string;
  duration_months: number | null;
  max_redemptions: number | null;
  redemption_count: number;
  is_active: boolean;
  redeemable_until: string | null;
  course_products: { name: string } | null;
};

type Order = {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  course_products: { name: string } | null;
};

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const newCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `3M-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
};

export default function CourseSalesAdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [productId, setProductId] = useState("3b400000-0000-4000-8000-000000000001");
  const [durationMonths, setDurationMonths] = useState("3");
  const [maxRedemptions, setMaxRedemptions] = useState("1");
  const [redeemableUntil, setRedeemableUntil] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: productRows }, { data: codeRows }, { data: orderRows }] = await Promise.all([
      (supabase as any).from("course_products").select("id,name,price_cents,stripe_price_id").order("display_order"),
      (supabase as any).from("course_access_codes")
        .select("id,code,name,duration_months,max_redemptions,redemption_count,is_active,redeemable_until,course_products(name)")
        .order("created_at", { ascending: false }),
      (supabase as any).from("course_orders")
        .select("id,amount_cents,status,created_at,paid_at,course_products(name)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setProducts((productRows ?? []) as Product[]);
    setCodes((codeRows ?? []) as AccessCode[]);
    setOrders((orderRows ?? []) as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const paidOrders = orders.filter((order) => order.status === "paid");
  const revenue = useMemo(() => paidOrders.reduce((sum, order) => sum + order.amount_cents, 0), [paidOrders]);

  async function createAccessCode() {
    setCreating(true);
    const code = newCode();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await (supabase as any).from("course_access_codes").insert({
      code,
      name: `Cortesia ${code}`,
      product_id: productId,
      duration_months: Number(durationMonths),
      max_redemptions: Number(maxRedemptions),
      redeemable_until: redeemableUntil ? new Date(`${redeemableUntil}T23:59:59`).toISOString() : null,
      created_by: user?.id ?? null,
    });
    setCreating(false);
    if (error) return toast.error(`Erro ao criar código: ${error.message}`);
    await navigator.clipboard.writeText(code);
    toast.success(`Código ${code} criado e copiado.`);
    await load();
  }

  async function toggleCode(item: AccessCode) {
    const { error } = await (supabase as any).from("course_access_codes").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) return toast.error("Não foi possível alterar o código.");
    await load();
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado.");
  }

  async function syncStripeCatalog() {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("create-course-checkout", {
      body: { syncCatalog: true },
    });
    setSyncing(false);
    if (error || !data?.success) return toast.error(data?.error || "Não foi possível sincronizar o Stripe.");
    toast.success(`${data.synchronized} produto(s) sincronizado(s) no Stripe.`);
    await load();
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Vendas pagas</p>
          <p className="mt-1 font-montserrat text-2xl font-black">{paidOrders.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Receita registrada</p>
          <p className="mt-1 font-montserrat text-2xl font-black text-brand-green">{money(revenue)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Produtos sincronizados</p>
          <p className="mt-1 font-montserrat text-2xl font-black">{products.filter((product) => product.stripe_price_id).length}/{products.length}</p>
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => void syncStripeCatalog()} disabled={syncing}>
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sincronizar Stripe
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-secondary" />
          <h3 className="font-montserrat font-black">Gerar código gratuito</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Produto liberado</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duração do acesso</Label>
            <Select value={durationMonths} onValueChange={setDurationMonths}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 6, 12].map((month) => <SelectItem key={month} value={String(month)}>{month} {month === 1 ? "mês" : "meses"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Máximo de usos</Label>
            <Input type="number" min="1" value={maxRedemptions} onChange={(event) => setMaxRedemptions(event.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Data limite para resgate (opcional)</Label>
            <Input type="date" value={redeemableUntil} onChange={(event) => setRedeemableUntil(event.target.value)} />
          </div>
          <div className="flex items-end sm:col-span-2">
            <Button className="w-full" onClick={() => void createAccessCode()} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Gerar e copiar código
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-montserrat font-black">Códigos de acesso</h3>
          <Button variant="ghost" size="sm" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />Atualizar</Button>
        </div>
        <div className="space-y-2">
          {codes.map((item) => (
            <div key={item.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${item.is_active ? "" : "opacity-55"}`}>
              <button className="font-mono text-sm font-bold text-secondary" onClick={() => void copyCode(item.code)}>
                {item.code} <Copy className="ml-1 inline h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-xs text-muted-foreground">{item.course_products?.name} · {item.duration_months} meses</span>
              <span className="text-xs font-semibold">{item.redemption_count}/{item.max_redemptions ?? "∞"} usos</span>
              <Button variant="ghost" size="icon" onClick={() => void toggleCode(item)} title={item.is_active ? "Desativar" : "Ativar"}>
                <Power className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-secondary" />
          <h3 className="font-montserrat font-black">Compras recentes</h3>
        </div>
        <div className="space-y-2">
          {orders.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma compra registrada.</p>}
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <div>
                <p className="font-semibold">{order.course_products?.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{money(order.amount_cents)}</p>
                <p className={`text-xs ${order.status === "paid" ? "text-brand-green" : "text-muted-foreground"}`}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
