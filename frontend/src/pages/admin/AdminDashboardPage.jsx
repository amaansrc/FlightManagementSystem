import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Plane, CalendarDays } from 'lucide-react';
import BorderGlowCard from '../../components/ui/BorderGlowCard';

/**
 * Admin dashboard — hub page with navigation cards.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Manage Flights',
      description: 'Add, view, search, update, or delete aircraft from the fleet.',
      icon: <Plane className="w-8 h-8" />,
      to: '/admin/flights',
    },
    {
      title: 'Manage Scheduled Flights',
      description: 'Schedule flights, set routes, timings, and ticket pricing.',
      icon: <CalendarDays className="w-8 h-8" />,
      to: '/admin/scheduled-flights',
    },
  ];

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome, Admin!
        </h1>
        <p className="mt-1" style={{ color: '#94A3B8' }}>
          Logged in as <span className="font-medium text-white">{user?.userName}</span>
        </p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="block no-underline group h-full"
          >
            <BorderGlowCard className="h-full p-6 transition-all group-hover:scale-[1.02]">
              <div className="mb-3 text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors">{card.icon}</div>
              <h2 className="text-lg font-semibold text-white group-hover:text-[#3B82F6] transition-colors">
                {card.title}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{card.description}</p>
            </BorderGlowCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
