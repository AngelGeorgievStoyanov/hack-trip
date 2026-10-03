import type { Metadata } from 'next';
import { absoluteUrl } from '@/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Terms of use and privacy policy for HackTrip.',
  alternates: { canonical: absoluteUrl('/privacy-policy') },
  openGraph: {
    title: 'Privacy Policy',
    description: 'Terms of use and privacy policy for HackTrip.',
    url: absoluteUrl('/privacy-policy'),
    siteName: 'HackTrip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy',
    description: 'Terms of use and privacy policy for HackTrip.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 760 }}>
      <h1>Privacy Policy</h1>

      <h2>Terms of use and privacy policy</h2>
      <p>Welcome in hack trip. These terms and conditions outline the rules for using the service.</p>

      <h2>Terms and conditions</h2>
      <p>
        By accessing this website, you agree to be bound by these terms and to comply with all
        applicable laws and regulations.
      </p>

      <h3>Accounts and membership</h3>
      <p>
        You are responsible for maintaining the security of your account and for all activity that
        occurs under it.
      </p>

      <h3>User content</h3>
      <p>
        You retain ownership of the content you create, while granting us the license needed to
        operate the service.
      </p>

      <h3>Backups</h3>
      <p>
        We perform regular backups but cannot guarantee that data will never be lost.
      </p>

      <h3>Links to other resources</h3>
      <p>
        The service may link to third-party resources. We are not responsible for their content or
        practices.
      </p>

      <h3>Prohibited uses</h3>
      <p>
        You may not use the service for unlawful purposes or to harm, harass, or impersonate others.
      </p>

      <h3>Intellectual property rights</h3>
      <p>
        The service and its original content remain the property of HackTrip and its licensors.
      </p>

      <h3>Limitation of liability</h3>
      <p>
        To the maximum extent permitted by law, HackTrip is not liable for indirect or consequential
        damages arising from use of the service.
      </p>

      <h3>Indemnification</h3>
      <p>You agree to indemnify HackTrip against claims arising from your use of the service.</p>

      <h3>Severability</h3>
      <p>
        If any provision of these terms is held invalid, the remaining provisions remain in effect.
      </p>

      <h3>Dispute resolution</h3>
      <p>
        Disputes arising from these terms will be resolved in accordance with applicable law.
      </p>

      <h3>Changes and amendments</h3>
      <p>We may update these terms from time to time.</p>

      <h3>Acceptance of these terms</h3>
      <p>By continuing to use the service, you accept these terms.</p>

      <h3>Contacting us</h3>
      <p>You can contact us at email: www.hack.trip@gmail.com</p>

      <h2>Our Principles</h2>
      <p>We handle personal information with care and use it only to provide and improve the service.</p>

      <h2>Information We Collect</h2>
      <h3>Information You Provide Directly to Us</h3>
      <p>This includes account details such as your name and email address.</p>
      <h3>Information that Is Automatically Collected</h3>
      <p>
        This includes usage data and technical information collected as you interact with the
        service.
      </p>
      <h3>Information from Third Parties</h3>
      <p>We may receive information about you from third-party services.</p>

      <h2>How We Use Your Information</h2>
      <p>We use your information to provide the service, communicate with you, and improve it.</p>

      <h2>When We Disclose Your Information</h2>
      <p>
        We may share information with service providers, for legal compliance, in connection with a
        business transfer, with affiliated companies, with your consent, or in aggregate or
        de-identified form.
      </p>

      <h2>Legal Basis for Processing Personal Data</h2>
      <p>
        We process personal data to honour our commitments to you, for legitimate interests, for
        legal compliance, and with your consent.
      </p>

      <h2>Online Analytics</h2>
      <p>We may use analytics to understand how the service is used.</p>

      <h2>Email Unsubscribe</h2>
      <p>You can unsubscribe from our communications at any time.</p>

      <h2>Account Preferences</h2>
      <p>You can review and update your account preferences.</p>

      <h2>EU Data Subject Rights</h2>
      <p>
        Where applicable, you have rights of access, correction, deletion, and data portability.
      </p>

      <h2>International Transfers</h2>
      <p>Your information may be transferred to and processed in other countries.</p>

      <h2>Security Measures</h2>
      <p>We use reasonable safeguards to protect your information.</p>

      <h2>Children</h2>
      <p>The service is not directed at children.</p>

      <h2>Data Retention</h2>
      <p>We retain information for as long as necessary to provide the service.</p>

      <h2>Third-Party Links and Services</h2>
      <p>We are not responsible for the practices of third-party services linked from the service.</p>

      <h2>Changes to this Privacy Policy</h2>
      <p>We may update this policy from time to time.</p>

      <h2>Questions About this Privacy Policy</h2>
      <p>If you have questions, you can contact us at email: www.hack.trip@gmail.com</p>
    </main>
  );
}
