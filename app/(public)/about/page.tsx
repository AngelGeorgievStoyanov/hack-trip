import type { Metadata } from 'next';
import Image from 'next/image';
import { absoluteUrl } from '@/config';
import { IMAGE_PRESETS } from '@/constants/images/presets';

const ABOUT_IMAGE = IMAGE_PRESETS.aboutIllustration;

export const metadata: Metadata = {
  title: 'About',
  description: 'Plan trips, set every point and share your journey live with HackTrip.',
  alternates: { canonical: absoluteUrl('/about') },
  openGraph: {
    title: 'About',
    description: 'Plan trips, set every point and share your journey live with HackTrip.',
    url: absoluteUrl('/about'),
    siteName: 'HackTrip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About',
    description: 'Plan trips, set every point and share your journey live with HackTrip.',
  },
};

export default function AboutPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>About</h1>
      <h2>Welcome travelers or future travelers!</h2>
      <h2>Welcome in Hack Trip!</h2>
      <h2>Hack Trip is an app where you can share your trips or get valuable tips for your future trips.</h2>
      <h3>
        The idea of Hack Trip is to help all travelers, if you want to visit a certain
        destination, city or area, enter to search for information and see other travelers if
        they have been there and if they have described what they recommend and then if wish
        you could add your journey and be of help.
      </h3>
      <h4>
        It&apos;s integrated for you Google Maps and you can add points Markers.
      </h4>
      <Image
        src="https://storage.googleapis.com/hack-trip/hack-trip-markers.png"
        alt="Google Maps markers added in a HackTrip trip"
        width={ABOUT_IMAGE.width}
        height={ABOUT_IMAGE.height}
        sizes={ABOUT_IMAGE.sizes}
        style={{ width: '100%', height: 'auto', maxWidth: 640 }}
      />
      <h4>
        As you can mark everything you want, a city, hotel, restaurant, shop, hidden beach or
        why not if you are in the mountains add points there too and it becomes like an eco
        trail, it all depends on the person how much it wants to be detailed and what it wants
        to describe.
      </h4>
      <Image
        src="https://storage.googleapis.com/hack-trip/hack-trip-points1.0.png"
        alt="Points marked in a HackTrip trip"
        width={ABOUT_IMAGE.width}
        height={ABOUT_IMAGE.height}
        sizes={ABOUT_IMAGE.sizes}
        style={{ width: '100%', height: 'auto', maxWidth: 640 }}
      />
      <h4>
        You can also, if you have a trip coming up, plan your trip, set every single point and
        then follow them and of course if you decide you can edit them later when you are on
        the spot, if you want to add photos or a description and so others will be able to
        follow your journey live with you.
      </h4>
      <Image
        src="https://storage.googleapis.com/hack-trip/hack-trip-points1.1.png"
        alt="Planned trip points followed live in HackTrip"
        width={ABOUT_IMAGE.width}
        height={ABOUT_IMAGE.height}
        sizes={ABOUT_IMAGE.sizes}
        style={{ width: '100%', height: 'auto', maxWidth: 640 }}
      />
      <Image
        src="https://storage.googleapis.com/hack-trip/hack-trip-points2.0.png"
        alt="Trip points edited on the spot in HackTrip"
        width={ABOUT_IMAGE.width}
        height={ABOUT_IMAGE.height}
        sizes={ABOUT_IMAGE.sizes}
        style={{ width: '100%', height: 'auto', maxWidth: 640 }}
      />
      <Image
        src="https://storage.googleapis.com/hack-trip/hack-trip-points2.1.png"
        alt="Trip photos and descriptions added in HackTrip"
        width={ABOUT_IMAGE.width}
        height={ABOUT_IMAGE.height}
        sizes={ABOUT_IMAGE.sizes}
        style={{ width: '100%', height: 'auto', maxWidth: 640 }}
      />
      <Image
        src="https://storage.googleapis.com/hack-trip/hack-trip-points3.png"
        alt="HackTrip trip shared with other travelers"
        width={ABOUT_IMAGE.width}
        height={ABOUT_IMAGE.height}
        sizes={ABOUT_IMAGE.sizes}
        style={{ width: '100%', height: 'auto', maxWidth: 640 }}
      />
      <h5>Enjoy the Hack Trip!</h5>
      <h5>You can contact us at email: www.hack.trip@gmail.com</h5>
    </main>
  );
}
