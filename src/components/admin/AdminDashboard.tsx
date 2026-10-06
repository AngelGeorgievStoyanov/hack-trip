import Link from 'next/link';

const sections = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/failed-login-logs', label: 'Failed login logs' },
  { href: '/admin/route-not-found-logs', label: 'Route not found logs' },
  { href: '/admin/images', label: 'Image inventory' },
];

export function AdminDashboard() {
  return (
    <nav>
      <ul>
        {sections.map((section) => (
          <li key={section.href}>
            <Link href={section.href}>{section.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
