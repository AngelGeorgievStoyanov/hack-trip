import type { Metadata } from 'next';
import Image from 'next/image';
import { WelcomeHeading } from '@/components/common/WelcomeHeading';
import { IMAGE_PRESETS } from '@/constants/images/presets';
import { buildSeoMetadata } from '@/seo';

const ABOUT_IMAGE = IMAGE_PRESETS.aboutIllustration;

export const metadata: Metadata = buildSeoMetadata({
  title: 'About — Create, Plan and Share Trips',
  description:
    'Create travel itineraries, plan routes, add GPS locations anywhere in the world, describe restaurants, hidden beaches and other places, then share your journey with HackTrip.',
  canonicalPath: '/about',
});

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
      <WelcomeHeading>
        <article className="about-page__content">
          <h2>Discover More. Plan Better. Share Every Journey.</h2>
          <p>
            HackTrip is a travel planning and sharing platform where you can create your own trips,
            organize them day by day, map the places that matter to you and share useful experiences
            with other travelers.
          </p>

          <Image
            src="/og/hacktrip-travel-planner.svg"
            alt="HackTrip travel planner illustration with a route, map pins and an airplane"
            width={1200}
            height={630}
            priority
            style={{ ...imageStyle, maxWidth: 760 }}
          />

          <section aria-labelledby="create-trips">
            <h2 id="create-trips">Create and organize your trips</h2>
            <p>
              Build a trip around your destination, arrange it into days and add as many stops as
              you need. Keep your itinerary and travel ideas organized in one place.
            </p>
          </section>

          <section aria-labelledby="gps-locations">
            <h2 id="gps-locations">Add any location with GPS coordinates</h2>
            <p>
              Save places anywhere in the world, including remote spots that do not have a
              recognized name on the map. A GPS position is enough to mark the exact place you want
              to remember or visit.
            </p>
          </section>

          <Image
            src="https://storage.googleapis.com/hack-trip/hack-trip-markers.png"
            alt="HackTrip map with travel location markers"
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            sizes={ABOUT_IMAGE.sizes}
            style={{ ...imageStyle, maxWidth: 520 }}
          />

          <section aria-labelledby="discover-places">
            <h2 id="discover-places">Save the places worth discovering</h2>
            <p>
              Add restaurants, hotels, attractions, shops, viewpoints, mountain locations, hidden
              beaches, nature spots and places known mainly by locals. Your map can include popular
              destinations as well as the small discoveries that make a journey memorable.
            </p>
          </section>

          <div className="about-page__image-row">
            <Image
              src="https://storage.googleapis.com/hack-trip/hack-trip-points1.0.png"
              alt="Travel points displayed on a HackTrip map"
              width={ABOUT_IMAGE.width}
              height={ABOUT_IMAGE.height}
              sizes={ABOUT_IMAGE.sizes}
              style={imageStyle}
            />
            <Image
              src="https://storage.googleapis.com/hack-trip/hack-trip-points1.1.png"
              alt="Different types of locations saved in a HackTrip itinerary"
              width={ABOUT_IMAGE.width}
              height={ABOUT_IMAGE.height}
              sizes={ABOUT_IMAGE.sizes}
              style={imageStyle}
            />
          </div>

          <section aria-labelledby="describe-experiences">
            <h2 id="describe-experiences">Describe places with useful details</h2>
            <p>
              Add photos, descriptions and personal tips to your points. Share what makes a place
              special, how to find it and what another traveler should know before visiting.
            </p>
          </section>

          <div className="about-page__image-row">
            <Image
              src="https://storage.googleapis.com/hack-trip/hack-trip-points2.0.png"
              alt="A route planned with selected HackTrip locations"
              width={ABOUT_IMAGE.width}
              height={ABOUT_IMAGE.height}
              sizes={ABOUT_IMAGE.sizes}
              style={imageStyle}
            />
            <Image
              src="https://storage.googleapis.com/hack-trip/hack-trip-points2.1.png"
              alt="Descriptions and details for a saved HackTrip location"
              width={ABOUT_IMAGE.width}
              height={ABOUT_IMAGE.height}
              sizes={ABOUT_IMAGE.sizes}
              style={imageStyle}
            />
          </div>

          <section aria-labelledby="plan-share">
            <h2 id="plan-share">Plan your route and share your journey</h2>
            <p>
              Prepare your stops before you leave, update your trip as you travel, add new
              discoveries along the way and let others follow your journey live when you choose to
              share it.
            </p>
          </section>

          <Image
            src="https://storage.googleapis.com/hack-trip/hack-trip-points3.png"
            alt="A HackTrip journey shared with other travelers"
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            sizes={ABOUT_IMAGE.sizes}
            style={imageStyle}
          />

          <section aria-labelledby="travel-community">
            <h2 id="travel-community">Explore trips shared by other travelers</h2>
            <p>
              Browse real itineraries for inspiration, discover places you might otherwise miss and
              use other travelers’ experiences when planning your next adventure. Then share your
              own discoveries with the HackTrip community.
            </p>
          </section>

          <h2>Make every stop part of the story.</h2>
          <p>
            Have a question or an idea for HackTrip? Contact us at{' '}
            <a href="mailto:www.hack.trip@gmail.com">www.hack.trip@gmail.com</a>.
          </p>
        </article>
      </WelcomeHeading>
    </main>
  );
}
