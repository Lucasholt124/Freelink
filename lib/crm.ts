type CustomerSearchRecord = {
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt: number;
  lastPurchase?: number;
};

const searchable = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

/** Read-only view of the existing customer records; never changes their fields. */
export function filterCrmCustomers<T extends CustomerSearchRecord>(
  customers: readonly T[],
  search: string,
  status: string,
  sort: string,
): T[] {
  const term = searchable(search);
  const digits = term.replace(/\D/g, "");
  // Names containing numbers must still be searched as names, not phone fragments.
  const isPhoneSearch = digits.length > 0 && /^[\d\s()+.\-]+$/.test(term);
  return customers.filter((customer) => {
    const matchesSearch = !term || searchable(customer.name).includes(term) ||
      searchable(customer.email || "").includes(term) ||
      (isPhoneSearch && (customer.phone || "").replace(/\D/g, "").includes(digits));
    return matchesSearch && (status === "all" || customer.status === status);
  }).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "date") return b.createdAt - a.createdAt;
    if (sort === "lastContact") return (b.lastPurchase || b.createdAt) - (a.lastPurchase || a.createdAt);
    return 0;
  });
}
