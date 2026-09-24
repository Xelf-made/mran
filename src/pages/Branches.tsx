import { Clock, MapPin, Navigation, Phone, Stethoscope, Truck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';

interface Branch {
  name: string;
  address: string;
  area: string;
  phone: string;
  hours: string;
  services: string[];
  mapUrl: string;
  mapsLink: string;
}

const branches: Branch[] = [
  {
    name: 'CBD Branch',
    address: 'Moi Avenue, Ground Floor, I&M Bank Building',
    area: 'Nairobi CBD',
    phone: '+254 700 123 456',
    hours: 'Mon–Sat: 7:00 AM – 9:00 PM · Sun: 10:00 AM – 6:00 PM',
    services: ['In-store Pharmacist Consultation', 'Prescription Pickup', 'M-Pesa Payments'],
    mapUrl: 'https://maps.google.com/?q=I%26M+Bank+Building+Moi+Avenue+Nairobi',
    mapsLink: 'https://www.google.com/maps/dir/?api=1&destination=I%26M+Bank+Building+Moi+Avenue+Nairobi',
  },
  {
    name: 'Westlands Branch',
    address: 'Ring Road Westlands, Sarit Centre, Ground Floor',
    area: 'Westlands, Nairobi',
    phone: '+254 700 234 567',
    hours: 'Mon–Sun: 8:00 AM – 10:00 PM',
    services: ['24/7 Pickup Locker', 'In-store Pharmacist Consultation', 'Drive-thru Collection'],
    mapUrl: 'https://maps.google.com/?q=Sarit+Centre+Westlands+Nairobi',
    mapsLink: 'https://www.google.com/maps/dir/?api=1&destination=Sarit+Centre+Westlands+Nairobi',
  },
  {
    name: 'Kilimani Branch',
    address: 'Argwings Kodhek Road, Yaya Centre, Ground Floor',
    area: 'Kilimani, Nairobi',
    phone: '+254 700 345 678',
    hours: 'Mon–Sat: 7:30 AM – 8:30 PM · Sun: 9:00 AM – 5:00 PM',
    services: ['In-store Pharmacist Consultation', 'Prescription Pickup', 'Blood Pressure Checks'],
    mapUrl: 'https://maps.google.com/?q=Yaya+Centre+Argwings+Kodhek+Road+Nairobi',
    mapsLink: 'https://www.google.com/maps/dir/?api=1&destination=Yaya+Centre+Argwings+Kodhek+Road+Nairobi',
  },
];

const serviceIcons: Record<string, typeof Clock> = {
  'In-store Pharmacist Consultation': Stethoscope,
  'Prescription Pickup': Truck,
  '24/7 Pickup Locker': Clock,
  'M-Pesa Payments': Phone,
  'Drive-thru Collection': Truck,
  'Blood Pressure Checks': Stethoscope,
};

export function BranchesPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="shell">
          <span className="eyebrow">Store locator</span>
          <h1>Find a Moran Pharmacy near you</h1>
          <p>Visit any of our Nairobi branches for in-store pharmacist consultations, prescription pickup, and more.</p>
        </div>
      </section>

      <section className="shell branches">
        <div className="branches__grid">
          {branches.map((branch) => (
            <div className="branch-card" key={branch.name}>
              <div className="branch-card__head">
                <MapPin size={22} />
                <div>
                  <h3>{branch.name}</h3>
                  <span>{branch.area}</span>
                </div>
              </div>
              <div className="branch-card__body">
                <div className="branch-card__row">
                  <MapPin size={15} />
                  <span>{branch.address}</span>
                </div>
                <div className="branch-card__row">
                  <Phone size={15} />
                  <a href={`tel:${branch.phone.replace(/\s/g, '')}`}>{branch.phone}</a>
                </div>
                <div className="branch-card__row">
                  <Clock size={15} />
                  <span>{branch.hours}</span>
                </div>
              </div>
              <div className="branch-card__services">
                {branch.services.map((s) => {
                  const Icon = serviceIcons[s] ?? Clock;
                  return <span className="branch-card__service" key={s}><Icon size={13} /> {s}</span>;
                })}
              </div>
              <a href={branch.mapsLink} target="_blank" rel="noreferrer" className="btn btn--outline branch-card__directions">
                <Navigation size={15} /> Get directions
              </a>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
