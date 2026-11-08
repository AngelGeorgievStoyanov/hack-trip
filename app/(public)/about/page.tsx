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

const imageStyle = {
  display: 'block',
  width: '100%',
  height: 'auto',
  maxWidth: 640,
  margin: '20px auto',
  padding: '12px',
  boxSizing: 'border-box' as const,
  objectFit: 'contain' as const,
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-page__content">
        <h1>Welcome travelers or future travelers!</h1>
        <h1>Welcome in Hack Trip!</h1>
        <h2>
          Hack Trip is an app where you can share your trips or get valuable tips for your future
          trips.
        </h2>
        <h3>
          The idea of Hack Trip is to help all travelers. If you want to visit a certain
          destination, city or area, search for information and see whether other travelers have
          been there and what they recommend. You can then add your own journey and help other
          travelers.
        </h3>

        <Image
          src="https://storage.googleapis.com/hack-trip/hack-trip-markers.png"
          alt="HackTrip map markers"
          width={ABOUT_IMAGE.width}
          height={ABOUT_IMAGE.height}
          sizes={ABOUT_IMAGE.sizes}
          style={{ ...imageStyle, maxWidth: 520 }}
        />
        <h3>Hack Trip is integrated with Google Maps, where you can add point markers.</h3>

        <div className="about-page__image-row">
          <Image
            src="https://storage.googleapis.com/hack-trip/hack-trip-points1.0.png"
            alt="Trip points displayed on a map"
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            sizes={ABOUT_IMAGE.sizes}
            style={imageStyle}
          />
          <Image
            src="https://storage.googleapis.com/hack-trip/hack-trip-points1.1.png"
            alt="More examples of points on a HackTrip map"
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            sizes={ABOUT_IMAGE.sizes}
            style={imageStyle}
          />
        </div>

        <h3>
          You can mark anything you want: a city, hotel, restaurant, shop, hidden beach or mountain
          location. You can even turn your points into an eco trail. The level of detail is entirely
          up to you and what you want to describe.
        </h3>

        <div className="about-page__image-row">
          <Image
            src="https://storage.googleapis.com/hack-trip/hack-trip-points2.0.png"
            alt="A HackTrip route with selected points"
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            sizes={ABOUT_IMAGE.sizes}
            style={imageStyle}
          />
          <Image
            src="https://storage.googleapis.com/hack-trip/hack-trip-points2.1.png"
            alt="Trip point details in HackTrip"
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            sizes={ABOUT_IMAGE.sizes}
            style={imageStyle}
          />
        </div>

        <h3>
          If you have a trip coming up, you can plan it by setting every point in advance and then
          following your route. You can edit the points later when you are there, add photos or
          descriptions, and let others follow your journey live.
        </h3>

        <Image
          src="https://storage.googleapis.com/hack-trip/hack-trip-points3.png"
          alt="A journey shared live with other HackTrip users"
          width={ABOUT_IMAGE.width}
          height={ABOUT_IMAGE.height}
          sizes={ABOUT_IMAGE.sizes}
          style={imageStyle}
        />

        <h2>Enjoy the Hack Trip!</h2>
        <h3>
          You can contact us at email:{' '}
          <a href="mailto:www.hack.trip@gmail.com">www.hack.trip@gmail.com</a>
        </h3>
      </div>
    </main>
  );
}
