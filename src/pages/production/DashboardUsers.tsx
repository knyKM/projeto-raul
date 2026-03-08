import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, Loader2, Shield, Eye, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth, type UserRole } from "@/lib/authContext";
import { toast } from "sonner";

interface UserRecord {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  created_at: string;
}

const roleLabels: Record<UserRole, string> = {
  atendente: "Atendente",
  supervisor: "Supervisor",
  administrador: "Administrador",
};

const roleBadgeVariant: Record<UserRole, "default" | "secondary" | "outline"> = {
  administrador: "default",
  supervisor: "secondary",
  atendente: "outline",
};

const roleDescriptions: Record<UserRole, string> = {
  atendente: "Atribuir e atender leads",
  supervisor: "Gerenciar leads, atendentes e landing pages",
  administrador: "Acesso completo ao sistema",
};

const DashboardUsers = () => {
  const { token, hasRole } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", password: "", role: "atendente" as UserRole });
  const [saving, setSaving] = useState(false);

  const apiUrl = localStorage.getItem("mogibens_api_url") || "";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    if (!form.nome || !form.email || (!editUser && !form.password)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const url = editUser ? `${apiUrl}/auth/users/${editUser.id}` : `${apiUrl}/auth/users`;
      const method = editUser ? "PUT" : "POST";
      const body: Record<string, unknown> = { nome: form.nome, email: form.email, role: form.role };
      if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erro ao salvar"); setSaving(false); return; }

      toast.success(editUser ? "Usuário atualizado" : "Usuário criado");
      setDialogOpen(false);
      setEditUser(null);
      setForm({ nome: "", email: "", password: "", role: "atendente" });
      fetchUsers();
    } catch { toast.error("Erro de conexão"); }
    setSaving(false);
  };

  const handleToggleActive = async (user: UserRecord) => {
    try {
      await fetch(`${apiUrl}/auth/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ativo: !user.ativo }),
      });
      fetchUsers();
      toast.success(user.ativo ? "Usuário desativado" : "Usuário ativado");
    } catch { toast.error("Erro ao atualizar"); }
  };

  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`Excluir ${user.nome}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/auth/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success("Usuário excluído"); fetchUsers(); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error("Erro ao excluir"); }
  };

  const openEdit = (user: UserRecord) => {
    setEditUser(user);
    setForm({ nome: user.nome, email: user.email, password: "", role: user.role });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditUser(null);
    setForm({ nome: "", email: "", password: "", role: "atendente" });
    setDialogOpen(true);
  };

  const isAdmin = hasRole("administrador");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Usuários</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Gerenciamento de usuários e permissões.</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew} size="sm">
                  <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">{editUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Nome</Label>
                    <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">{editUser ? "Nova Senha (deixe vazio para manter)" : "Senha"}</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Perfil</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atendente">Atendente</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{roleDescriptions[form.role]}</p>
                  </div>
                  <Button onClick={handleSave} className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editUser ? "Salvar Alterações" : "Criar Usuário"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Role legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["atendente", "supervisor", "administrador"] as UserRole[]).map((role) => (
            <Card key={role}>
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-body font-medium text-sm text-foreground">{roleLabels[role]}</p>
                  <p className="text-xs text-muted-foreground">{roleDescriptions[role]}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users table */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-body">Nenhum usuário cadastrado</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">Crie o primeiro usuário para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Nome</th>
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Email</th>
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Perfil</th>
                      <th className="text-center p-3 text-xs text-muted-foreground font-medium">Ativo</th>
                      {isAdmin && <th className="text-right p-3 text-xs text-muted-foreground font-medium">Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                        <td className="p-3 text-foreground font-medium">{u.nome}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <Badge variant={roleBadgeVariant[u.role]}>{roleLabels[u.role]}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          {isAdmin ? (
                            <Switch checked={u.ativo} onCheckedChange={() => handleToggleActive(u)} />
                          ) : (
                            <span className={u.ativo ? "text-green-500" : "text-muted-foreground/50"}>
                              {u.ativo ? "Sim" : "Não"}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(u)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardUsers;
