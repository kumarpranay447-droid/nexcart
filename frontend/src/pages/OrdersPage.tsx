import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, updateOrderStatus } from '../api/orders';
import type { OrderDto } from '../types';
import { extractErrorMessage } from '../utils/errors';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const updated = await updateOrderStatus(id, 'CANCELLED');
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>My Orders</h1>
        <Link to="/orders/new" className="btn">
          + New Order
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        {loading ? (
          <p className="hint">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="hint">
            No orders yet. <Link to="/orders/new">Create your first order</Link>.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    {order.items
                      .map((i) => `${i.productName} × ${i.quantity}`)
                      .join(', ')}
                  </td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    {(order.status === 'PENDING' ||
                      order.status === 'CONFIRMED') && (
                      <button
                        className="btn-danger"
                        onClick={() => handleCancel(order.id)}
                      >
                        Cancel
                      </button>
                    )}
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
