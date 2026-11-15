import { Button } from "@/components/ui/button";

export default function AccountPagination({ page, pages, onChange }: {
  page: number; pages: number; onChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Páginas de cuentas" className="flex flex-wrap items-center justify-between gap-3 mt-4">
      <p className="text-sm text-slate-500" role="status">Página {page} de {pages}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</Button>
        <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Siguiente</Button>
      </div>
    </nav>
  );
}
