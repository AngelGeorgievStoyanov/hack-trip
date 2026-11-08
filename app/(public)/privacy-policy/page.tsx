import type { Metadata } from 'next';
import { absoluteUrl } from '@/config';

export const metadata: Metadata = {
  title: 'Terms of Use & Privacy Policy',
  description: 'Terms of use and privacy policy for HackTrip.',
  alternates: { canonical: absoluteUrl('/privacy-policy') },
  openGraph: {
    title: 'Terms of Use & Privacy Policy',
    description: 'Terms of use and privacy policy for HackTrip.',
    url: absoluteUrl('/privacy-policy'),
    siteName: 'HackTrip',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use & Privacy Policy',
    description: 'Terms of use and privacy policy for HackTrip.',
  },
};

const terms = [
  {
    id: 'accounts-and-membership',
    title: 'Accounts and membership',
    paragraphs: [
      'You must be at least 18 years of age to use the Website and Services. By using the Website and Services and by agreeing to this Agreement you warrant and represent that you are at least 18 years of age. If you create an account on the Website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it. We may, but have no obligation to, monitor and review new accounts before you may sign in and start using the Services. Providing false contact information of any kind may result in the termination of your account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security. We will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions. We may suspend, disable, or delete your account (or any part thereof) if we determine that you have violated any provision of this Agreement or that your conduct or content would tend to damage our reputation and goodwill. If we delete your account for the foregoing reasons, you may not re-register for our Services. We may block your email address and Internet protocol address to prevent further registration.',
    ],
  },
  {
    id: 'user-content',
    title: 'User content',
    paragraphs: [
      'We do not own any data, information or material (collectively, “Content”) that you submit on the Website in the course of using the Service. You shall have sole responsibility for the accuracy, quality, integrity, legality, reliability, appropriateness, and intellectual property ownership or right to use of all submitted Content. We may, but have no obligation to, monitor and review the Content on the Website submitted or created using our Services by you. You grant us permission to access, copy, distribute, store, transmit, reformat, display and perform the Content of your user account solely as required for the purpose of providing the Services to you. Without limiting any of those representations or warranties, we have the right, though not the obligation, to, in our own sole discretion, refuse or remove any Content that, in our reasonable opinion, violates any of our policies or is in any way harmful or objectionable. Unless specifically permitted by you, your use of the Website and Services does not grant us the license to use, reproduce, adapt, modify, publish or distribute the Content created by you or stored in your user account for commercial, marketing or any similar purpose.',
    ],
  },
  {
    id: 'backups',
    title: 'Backups',
    paragraphs: [
      'We are not responsible for the Content residing on the Website. In no event shall we be held liable for any loss of any Content. It is your sole responsibility to maintain appropriate backup of your Content. Notwithstanding the foregoing, on some occasions and in certain circumstances, with absolutely no obligation, we may be able to restore some or all of your data that has been deleted as of a certain date and time when we may have backed up data for our own purposes. We make no guarantee that the data you need will be available.',
    ],
  },
  {
    id: 'links-to-other-resources',
    title: 'Links to other resources',
    paragraphs: [
      'Although the Website and Services may link to other resources (such as websites, mobile applications, etc.), we are not, directly or indirectly, implying any approval, association, sponsorship, endorsement, or affiliation with any linked resource, unless specifically stated herein. We are not responsible for examining or evaluating, and we do not warrant the offerings of, any businesses or individuals or the content of their resources. We do not assume any responsibility or liability for the actions, products, services, and content of any other third parties. You should carefully review the legal statements and other conditions of use of any resource which you access through a link on the Website. Your linking to any other off-site resources is at your own risk.',
    ],
  },
  {
    id: 'prohibited-uses',
    title: 'Prohibited uses',
    paragraphs: [
      'In addition to other terms as set forth in the Agreement, you are prohibited from using the Website and Services or Content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Website and Services, third party products and services, or the Internet; (h) to spam, phish, pharm, pretext, spider, crawl, or scrape; (i) for any obscene or immoral purpose; or (j) to interfere with or circumvent the security features of the Website and Services, third party products and services, or the Internet. We reserve the right to terminate your use of the Website and Services for violating any of the prohibited uses.',
    ],
  },
  {
    id: 'intellectual-property-rights',
    title: 'Intellectual property rights',
    paragraphs: [
      '“Intellectual Property Rights” means all present and future rights conferred by statute, common law or equity in or in relation to any copyright and related rights, trademarks, designs, patents, inventions, goodwill and the right to sue for passing off, rights to inventions, rights to use, and all other intellectual property rights, in each case whether registered or unregistered and including all applications and rights to apply for and be granted, rights to claim priority from, such rights and all similar or equivalent rights or forms of protection and any other results of intellectual activity which subsist or will subsist now or in the future in any part of the world. This Agreement does not transfer to you any intellectual property owned by the Operator or third parties, and all rights, titles, and interests in and to such property will remain (as between the parties) solely with the Operator. All trademarks, service marks, graphics and logos used in connection with the Website and Services, are trademarks or registered trademarks of the Operator or its licensors. Other trademarks, service marks, graphics and logos used in connection with the Website and Services may be the trademarks of other third parties. Your use of the Website and Services grants you no right or license to reproduce or otherwise use any of the Operator or third party trademarks.',
    ],
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by applicable law, in no event will the Operator, its affiliates, directors, officers, employees, agents, suppliers or licensors be liable to any person for any indirect, incidental, special, punitive, cover or consequential damages (including, without limitation, damages for lost profits, revenue, sales, goodwill, use of content, impact on business, business interruption, loss of anticipated savings, loss of business opportunity) however caused, under any theory of liability, including, without limitation, contract, tort, warranty, breach of statutory duty, negligence or otherwise, even if the liable party has been advised as to the possibility of such damages or could have foreseen such damages. To the maximum extent permitted by applicable law, the aggregate liability of the Operator and its affiliates, officers, employees, agents, suppliers and licensors relating to the services will be limited to an amount no greater than one dollar or any amounts actually paid in cash by you to the Operator for the prior one month period prior to the first event or occurrence giving rise to such liability. The limitations and exclusions also apply if this remedy does not fully compensate you for any losses or fails of its essential purpose.',
    ],
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    paragraphs: [
      'You agree to indemnify and hold the Operator and its affiliates, directors, officers, employees, agents, suppliers and licensors harmless from and against any liabilities, losses, damages or costs, including reasonable attorneys’ fees, incurred in connection with or arising from any third party allegations, claims, actions, disputes, or demands asserted against any of them as a result of or relating to your Content, your use of the Website and Services or any willful misconduct on your part.',
    ],
  },
  {
    id: 'severability',
    title: 'Severability',
    paragraphs: [
      'All rights and restrictions contained in this Agreement may be exercised and shall be applicable and binding only to the extent that they do not violate any applicable laws and are intended to be limited to the extent necessary so that they will not render this Agreement illegal, invalid or unenforceable. If any provision or portion of any provision of this Agreement shall be held to be illegal, invalid or unenforceable by a court of competent jurisdiction, it is the intention of the parties that the remaining provisions or portions thereof shall constitute their agreement with respect to the subject matter hereof, and all such remaining provisions or portions thereof shall remain in full force and effect.',
    ],
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute resolution',
    paragraphs: [
      'The formation, interpretation, and performance of this Agreement and any disputes arising out of it shall be governed by the substantive and procedural laws of Bulgaria without regard to its rules on conflicts or choice of law and, to the extent applicable, the laws of Bulgaria. The exclusive jurisdiction and venue for actions related to the subject matter hereof shall be the courts located in Bulgaria, and you hereby submit to the personal jurisdiction of such courts. You hereby waive any right to a jury trial in any proceeding arising out of or related to this Agreement. The United Nations Convention on Contracts for the International Sale of Goods does not apply to this Agreement.',
    ],
  },
  {
    id: 'changes-and-amendments',
    title: 'Changes and amendments',
    paragraphs: [
      'We reserve the right to modify this Agreement or its terms related to the Website and Services at any time at our discretion. When we do, we will revise the updated date at the bottom of this page. We may also provide notice to you in other ways at our discretion, such as through the contact information you have provided.',
      'An updated version of this Agreement will be effective immediately upon the posting of the revised Agreement unless otherwise specified. Your continued use of the Website and Services after the effective date of the revised Agreement (or such other act specified at that time) will constitute your consent to those changes.',
    ],
  },
  {
    id: 'acceptance-of-these-terms',
    title: 'Acceptance of these terms',
    paragraphs: [
      'You acknowledge that you have read this Agreement and agree to all its terms and conditions. By accessing and using the Website and Services you agree to be bound by this Agreement. If you do not agree to abide by the terms of this Agreement, you are not authorized to access or use the Website and Services.',
      'This terms and conditions policy was created with the help of WebsitePolicies.',
    ],
  },
  {
    id: 'contacting-us',
    title: 'Contacting us',
    paragraphs: [
      'If you have any questions, concerns, or complaints regarding this Agreement, we encourage you to contact us using the details below: www.hack.trip@gmail.com',
      'This document was last updated on March 24, 2023.',
    ],
  },
];

const privacySections = [
  {
    title: 'Our Principles',
    paragraphs: [
      'https://www.hack-trip.com has designed this policy to be consistent with the following principles:',
    ],
    bullets: [
      'https://www.hack-trip.com has designed this policy to be consistent with the following principles:',
      'Data collection, storage, and processing should be simplified as much as possible to enhance security, ensure consistency, and make the practices easy for users to understand.',
      'Data practices should meet the reasonable expectations of users.',
    ],
  },
  {
    title: 'Information We Collect',
    paragraphs: [
      'We collect information in multiple ways, including when you provide it directly to us, when it is collected automatically as you use the Services, and when it is provided by third parties.',
    ],
  },
  {
    title: 'Information You Provide Directly to Us',
    paragraphs: [
      'We will collect any information you provide to us. We may collect information from you in a variety of ways, such as when you create an online account, contact us or provide feedback, or subscribe to communications. This information may include your name, email address, phone number, mailing address, payment information and geographic location.',
    ],
  },
  {
    title: 'Information that Is Automatically Collected',
    paragraphs: [
      'Device/Usage Information. We may automatically collect certain information about the computer or devices (including mobile devices or tablets) you use to access the Services. This may include IP addresses, location information by country and city, unique device identifiers, browser types, browser language, operating system, mobile device carrier information, referring and exit pages and URLs, platform type, clicks, domain names, landing pages, pages and content viewed and the order of those pages, time spent on pages, dates and times of use, frequency of use, error logs and similar information.',
      'Cookies and Other Tracking Technologies. We also collect data about your use of the Services through Internet server logs and online tracking technologies, such as cookies and tracking pixels. Cookies may help recognize your computer, store preferences and settings, understand which pages you visit, improve your experience, perform analytics and assist with security. Tracking pixels may provide information about email or advertising interactions. You can change your browser settings to notify you when cookies are set or to block cookies, although some features may then be unavailable. The legacy policy also referred users to a separate Cookie Policy.',
    ],
  },
  {
    title: 'Information from Third Parties',
    paragraphs: [
      'To the extent permitted by law, we may also collect information from third parties, including public sources, social media platforms, and marketing and market research firms. Depending on the source, this information could include name, contact information, demographic information, employer information, identity or trustworthiness verification information, and information used for fraud or safety protection.',
    ],
  },
  {
    title: 'How We Use Your Information',
    paragraphs: ['We may use the information we collect from and about you to:'],
    bullets: [
      'Fulfill the purposes for which you provided it.',
      'Provide and improve the Services, develop new features, secure the Services, and provide technical and customer support.',
      'Send information about interactions or transactions, account alerts, and communications you have subscribed to.',
      'Process and respond to inquiries or request feedback.',
      'Conduct analytics, research, and reporting about use of the Services.',
      'Comply with the law and protect the safety, rights, property, or security of HackTrip, the Services, users, and the general public.',
      'Enforce the Terms of Use, including investigating potential violations.',
    ],
    after:
      'We may combine information collected directly and automatically with information obtained from affiliates or third parties. We may aggregate or de-identify information and use that data for purposes including research and marketing.',
  },
  {
    title: 'When We Disclose Your Information',
    paragraphs: [
      'We may disclose and/or share your information under the following circumstances:',
      'Service Providers. We may disclose information to third parties who perform services on our behalf, including customer support, data storage, data analysis and processing, marketing, and legal services.',
      'Legal Compliance and Protection. We may disclose information when required by law or when reasonably necessary to comply with legal process, enforce our Terms of Use and this Privacy Policy, respond to customer-service requests, protect rights, property or personal safety, or prevent fraud, spam or malware.',
      'Business Transfers. If we transfer or sell assets as part of a business transaction, your information may be disclosed as part of those assets.',
      'Affiliated Companies. We may disclose information to current or future affiliated companies.',
      'Consent. We may disclose information to third parties when you have consented to that disclosure.',
      'Aggregate/De-identified Information. We may disclose aggregated or de-identified data to third parties for any purpose.',
    ],
  },
  {
    title: 'Legal Basis for Processing Personal Data',
    paragraphs: [
      'Where applicable law requires us to identify a legal basis for processing personal data, we rely on the following bases:',
      'To Honor Our Contractual Commitments to You. Much of our processing is necessary to meet our contractual obligations to provide services to users.',
      'Legitimate Interests. We may process information where doing so furthers legitimate interests that are not overridden by the interests or fundamental rights and freedoms of affected individuals. These interests include customer service; marketing, advertising and fundraising; protecting users, personnel and property; managing user accounts; organizing events and programs; analyzing and improving our business; and managing legal issues. We may also process information for the legitimate interests of users and business partners.',
      'Legal Compliance. We may need to use and disclose information in certain ways to comply with legal obligations.',
      'Consent. Where required by law, and in other legally permissible cases, we process information on the basis of consent. Where processing is based on consent, you may withdraw that consent in accordance with applicable law.',
    ],
  },
  {
    title: 'Online Analytics',
    paragraphs: [
      'We may use third-party web analytics services (such as Google Analytics) to collect and analyze information and to conduct auditing, research or reporting. Information collected through analytics technologies, which may include IP addresses, may be disclosed to or collected directly by service providers. They may use it to evaluate use of the Services, analyze usage trends, assist with fraud prevention and provide certain features. The legacy policy referred users to the official Google Analytics Opt-out Browser Add-on.',
    ],
  },
  {
    title: 'Email Unsubscribe',
    paragraphs: [
      'You may unsubscribe from marketing emails at any time by emailing www.hack.trip@gmail.com with your request.',
    ],
  },
  {
    title: 'Account Preferences',
    paragraphs: [
      'If you have registered for an account through our Services, you can update your account information or adjust email communication preferences by logging into your account and updating your settings.',
    ],
  },
  {
    title: 'EU Data Subject Rights',
    paragraphs: [
      'Individuals in the European Economic Area (EEA) and other jurisdictions may have rights, subject to applicable exceptions and limitations, to obtain confirmation of whether we hold information about them, access that information, and obtain correction or deletion in appropriate circumstances. You may also have the right to object to processing, restrict processing, and withdraw consent. To exercise these rights, email www.hack.trip@gmail.com with the nature of your request. You may also contact the relevant supervisory authority.',
    ],
  },
  {
    title: 'International Transfers',
    paragraphs: [
      'We may share information with trusted service providers or business partners in countries other than your country of residence, in accordance with applicable law. Some countries may not offer the same level of protection as the privacy laws in your jurisdiction. Where required, we will take appropriate measures to ensure that personal data transferred outside the EEA receives an adequate level of protection.',
    ],
  },
  {
    title: 'Security Measures',
    paragraphs: [
      'We have implemented technical, physical, and organizational security measures to protect against loss, misuse and alteration of information. Safeguards vary based on the sensitivity of the information collected and stored. However, we cannot guarantee that these measures will prevent every unauthorized attempt to access, use or disclose information, since no Internet or electronic transmission can be completely secure.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'The Services are intended for users over the age of 18 and are not directed at children under the age of 13. The legacy policy stated that if we became aware of personal information collected from children under 13, or personal data from children under 16, we would take reasonable steps to delete it as soon as practicable.',
    ],
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'We retain information for as long as necessary to fulfill the purposes set forth in this Privacy Policy or as long as we are legally required or permitted to do so. Information may persist in backup and business-continuity copies for additional time.',
    ],
  },
  {
    title: 'Third-Party Links and Services',
    paragraphs: [
      'The Services may contain links to third-party websites, plug-ins and other services. If you choose to use them, you may disclose information to those third parties, their users and the public, depending on how their services operate. The collection, use and disclosure of information by those services is governed by their own privacy policies, not this Privacy Policy. We encourage you to read the privacy statements of every site you visit.',
    ],
  },
  {
    title: 'Changes to this Privacy Policy',
    paragraphs: [
      'We will continue to evaluate this Privacy Policy as we update and expand our Services and may make changes accordingly. We will post changes here and revise the last-updated date. We encourage you to check this page periodically. If we make material changes, we will provide notice as required by law.',
    ],
  },
  {
    title: 'Questions About this Privacy Policy',
    paragraphs: [
      'If you have questions about this Privacy Policy or our privacy practices, you can contact us at www.hack.trip@gmail.com.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <article className="legal-page__content">
        <h1>Welcome to Hack Trip</h1>
        <nav aria-label="Legal document sections" className="legal-page__intro-nav">
          <a href="#terms-of-use">Terms of use</a>
          <span>and</span>
          <a href="#privacy-policy">Privacy policy</a>
        </nav>

        <section aria-labelledby="terms-of-use">
          <h2 id="terms-of-use">Terms and conditions</h2>
          <p>
            These terms and conditions (“Agreement”) set forth the general terms and conditions of
            your use of the <a href="https://www.hack-trip.com">hack-trip.com</a> website (“Website”
            or “Service”) and any related products and services (“Services”). This Agreement is
            legally binding between you (“User”, “you” or “your”) and this Website operator
            (“Operator”, “we”, “us” or “our”). By accessing and using the Website and Services, you
            acknowledge that you have read, understood, and agree to be bound by this Agreement. If
            you do not agree, you must not access or use the Website and Services.
          </p>
          <div className="legal-page__toc">
            <h3>Table of contents</h3>
            <ol>
              {terms.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </div>
          {terms.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </section>

        <section aria-labelledby="privacy-policy">
          <h2 id="privacy-policy">Privacy Policy</h2>
          <p>
            <strong>Last Updated: 24.03.2023.</strong> This Privacy Policy (“Policy”) explains the
            information collection, use, and sharing practices of https://www.hack-trip.com (“we,”
            “us,” and “our”). Unless otherwise stated, this Policy describes practices relating to
            your use of our website and the services (“Services”) we provide or host on our servers.
            Please review this Policy before submitting information through the Services. By using
            any part of the Services, you understand that your information will be collected, used
            and disclosed as outlined here. If you do not agree, please do not use our Services.
          </p>
          {privacySections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.after ? <p>{section.after}</p> : null}
            </section>
          ))}
        </section>

        <p className="legal-page__contact">
          Questions or concerns? Contact us at{' '}
          <a href="mailto:www.hack.trip@gmail.com">www.hack.trip@gmail.com</a>.
        </p>
        <a className="legal-page__back" href="/">
          Back to Hack Trip
        </a>
      </article>
    </main>
  );
}
