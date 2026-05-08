// Validation and mask utilities for Brazilian form fields

// ── Masks ──────────────────────────────────────────────────────────────────

export function maskCNPJ(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 14);
  return n
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskCPF(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskPhone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) {
    return n
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return n
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

// ── Validators ─────────────────────────────────────────────────────────────

export function validateEmail(v: string): string {
  if (!v) return "Email é obrigatório.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Email inválido.";
  return "";
}

export function validatePhone(v: string): string {
  if (!v) return "";
  const n = v.replace(/\D/g, "");
  if (n.length < 10 || n.length > 11) return "Telefone inválido. Use (11) 99999-9999.";
  return "";
}

export function validateCNPJ(v: string): string {
  if (!v) return "";
  const n = v.replace(/\D/g, "");
  if (n.length !== 14) return "CNPJ incompleto.";
  if (!cnpjCheckDigits(n)) return "CNPJ inválido.";
  return "";
}

export function validateCPF(v: string): string {
  if (!v) return "";
  const n = v.replace(/\D/g, "");
  if (n.length !== 11) return "CPF incompleto.";
  if (!cpfCheckDigits(n)) return "CPF inválido.";
  return "";
}

export function validatePassword(v: string): string {
  if (!v) return "Senha é obrigatória.";
  if (v.length < 8) return "A senha deve ter ao menos 8 caracteres.";
  return "";
}

export function validateRequired(v: string, label: string): string {
  if (!v.trim()) return `${label} é obrigatório.`;
  return "";
}

// ── CNPJ / CPF check digits ────────────────────────────────────────────────

function cnpjCheckDigits(n: string): boolean {
  if (/^(\d)\1{13}$/.test(n)) return false;
  const calc = (digits: string, weights: number[]) => {
    const sum = digits.split("").reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(n.slice(0, 12), w1);
  const d2 = calc(n.slice(0, 13), w2);
  return d1 === parseInt(n[12]) && d2 === parseInt(n[13]);
}

function cpfCheckDigits(n: string): boolean {
  if (/^(\d)\1{10}$/.test(n)) return false;
  const calc = (digits: string, len: number) => {
    const sum = digits.split("").slice(0, len).reduce((acc, d, i) => acc + parseInt(d) * (len + 1 - i), 0);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(n, 9) === parseInt(n[9]) && calc(n, 10) === parseInt(n[10]);
}
