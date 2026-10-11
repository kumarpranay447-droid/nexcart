import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orders';
import { PRODUCTS } from '../data/products';
import type { CreateOrderItem } from '../types';
import { extractErrorMessage } from '../utils/errors';

interface Row extends CreateOrderItem {
  key: number;
}

let nextKey = 1;

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([
    { key: nextKey++, productName: PRODUCTS[0].name, quantity: 1, unitPrice: PRODUCTS[0].price },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: nextKey++, productName: '', quantity: 1, unitPrice: 0 },
    ]);
  }

  function pickProduct(key: number, productId: string) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) {
      updateRow(key, { productName: product.name, unitPrice: product.price });
    }
  }

  const total = rows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const items: CreateOrderItem[] = rows.map((r) => ({
        productName: r.productName.trim(),
        quantity: r.quantity,
        unitPrice: r.unitPrice,
      }));
      await createOrder(items);
      navigate('/orders');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>New Order</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {rows.map((row) => (
            <div className="item-row" key={row.key}>
              <label>
                Product
                <select
                  value={PRODUCTS.find((p) => p.name === row.productName)?.id ?? ''}
                  onChange={(e) => pickProduct(row.key, e.target.value)}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or custom product name"
                  value={row.productName}
                  onChange={(e) => updateRow(row.key, { productName: e.target.value })}
                  required
                  style={{ marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Qty
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(row.key, { quantity: Number(e.target.value) })
                  }
                  required
                />
              </label>
              <label>
                Unit price
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={row.unitPrice}
                  onChange={(e) =>
                    updateRow(row.key, { unitPrice: Number(e.target.value) })
                  }
                  required
                />
              </label>
              <button
                type="button"
                className="btn-danger"
                onClick={() => removeRow(row.key)}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={addRow}>
              + Add item
            </button>
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>
            Total: ${total.toFixed(2)}
          </h3>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </div>
    </div>
  );
}
