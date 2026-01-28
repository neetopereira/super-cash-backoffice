import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Clientes() {
  const { clients, addClient } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      id: `CLI-${Date.now()}`,
      name: formData.name,
      cpf: formData.cpf,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      createdAt: new Date(),
    });
    setFormData({ name: '', cpf: '', email: '', phone: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de clientes cadastrados
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      <div className="accent-line" />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="form-input pl-10"
        />
      </div>

      {/* New Client Form */}
      {showForm && (
        <div className="bg-card border border-border p-5">
          <h2 className="section-header">Cadastrar Novo Cliente</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="form-label">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="col-span-4 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado encontrado'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="font-mono text-xs">{client.id.slice(0, 12)}</td>
                  <td className="font-medium">{client.name}</td>
                  <td className="font-mono text-xs text-muted-foreground">{client.cpf}</td>
                  <td className="text-muted-foreground">{client.email || '—'}</td>
                  <td className="text-muted-foreground">{client.phone || '—'}</td>
                  <td className="text-muted-foreground text-xs">
                    {format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
