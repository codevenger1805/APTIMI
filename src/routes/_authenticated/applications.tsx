import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { STATUSES, STATUS_LABELS, computeAndSaveScore, type AppStatus } from "@/lib/aptimi";
import { Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications · APTIMI" }] }),
  component: Applications,
});

function Applications() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", location: "", link: "", status: "saved" as AppStatus });

  const { data: apps = [] } = useQuery({
    queryKey: ["apps", user.id],
    queryFn: async () => (await supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from("applications").insert({ ...form, user_id: user.id });
      await computeAndSaveScore(user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apps", user.id] });
      setOpen(false);
      setForm({ company: "", role: "", location: "", link: "", status: "saved" });
      toast.success("Application added");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus }) => {
      await supabase.from("applications").update({ status }).eq("id", id);
      await computeAndSaveScore(user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apps", user.id] }),
  });

  return (
    <div>
      <PageHeader eyebrow="Applications" title="Internship pipeline" subtitle="Track every opportunity from saved to offer." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add application</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New application</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Company</Label><Input className="mt-1" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label>Role</Label><Input className="mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              <div><Label>Location</Label><Input className="mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Link</Label><Input className="mt-1" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div>
                <Label>Status</Label>
                <select className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppStatus })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <Button onClick={() => add.mutate()} disabled={!form.company || !form.role} className="w-full">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <div className="px-8 py-8 overflow-x-auto">
        <div className="grid grid-cols-6 gap-3 min-w-[1100px]">
          {STATUSES.map((s) => {
            const items = apps.filter((a) => a.status === s);
            return (
              <div key={s} className="rounded-xl border border-border bg-secondary/40">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="eyebrow">{STATUS_LABELS[s]}</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">{items.length}</span>
                </div>
                <ul className="p-2 space-y-2 min-h-[120px]">
                  {items.map((a) => (
                    <li key={a.id} className="rounded-md border border-border bg-card p-3 text-sm">
                      <div className="font-medium truncate">{a.company}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.role}{a.location ? ` · ${a.location}` : ""}</div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <select value={a.status} onChange={(e) => updateStatus.mutate({ id: a.id, status: e.target.value as AppStatus })} className="h-7 rounded border border-input bg-background px-1.5 text-xs flex-1 min-w-0">
                          {STATUSES.map((s2) => <option key={s2} value={s2}>{STATUS_LABELS[s2]}</option>)}
                        </select>
                        {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
