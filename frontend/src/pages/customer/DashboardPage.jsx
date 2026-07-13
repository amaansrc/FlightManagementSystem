import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

/**
 * Customer dashboard — hub page with navigation cards.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Search Flights',
      description: 'Find and book available flights across India.',
      icon: '🔍',
      to: '/flights/search',
    },
    {
      title: 'My Bookings',
      description: 'View, manage, or cancel your existing bookings.',
      icon: '📋',
      to: '/bookings',
    },
  ];

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.userName}!
        </h1>
        <p className="text-slate-500 mt-1">What would you like to do today?</p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-light hover:shadow-sm transition-all no-underline group"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h2 className="text-lg font-semibold text-slate-800 group-hover:text-primary">
              {card.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
