import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders';
import { PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import type { OrderDto } from '../types';
import { extractErrorMessage } from '../utils/errors';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pending = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="container">
      <div className="page-title">
        <h1>Dashboard</h1>
        <Link to="/orders/new" className="btn">
          + New Order
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat">
          <div className="label">Total orders</div>
          <div className="value">{loading ? '…' : orders.length}</div>
        </div>
        <div className="stat">
          <div className="label">Pending</div>
          <div className="value">{loading ? '…' : pending}</div>
        </div>
        <div className="stat">
          <div className="label">Total spent</div>
          <div className="value">
            {loading ? '…' : `$${totalSpent.toFixed(2)}`}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Welcome, {user?.username} 👋</h3>
        <p className="hint">
          NexCart is a microservices demo: your requests travel from this React
          app through the Spring Cloud Gateway, which routes them to
          user-service and order-service discovered via Eureka. JWTs issued at
          login authenticate every call.
        </p>
      </div>

      <h2>Catalog</h2>
      <div className="grid-3">
        {PRODUCTS.map((p) => (
          <div className="card" key={p.id}>
            <h3>{p.name}</h3>
            <p className="hint">{p.description}</p>
            <p>
              <strong>${p.price.toFixed(2)}</strong>
            </p>
            <Link to="/orders/new" className="btn btn-secondary">
              Order now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
