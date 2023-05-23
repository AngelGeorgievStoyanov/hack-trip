import { Grid, Box, Button } from '@mui/material'
import { FC, MouseEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'


const TermPrivacy: FC = () => {


    const navigate = useNavigate()
    const handleClick = (e: MouseEvent) => {
        const element = e.target as HTMLLIElement


        if (element.className) {
            const elementFocus = document.getElementById(element.className)
            elementFocus?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const goBack = () => {
        navigate(-1)
    }
    return (

        <>
            <Helmet>
                <title>Hack Trip</title>
                <meta name='description' content='Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!' />
                <meta property="og:title" content="Hack Trip" />
                <meta property="og:url" content="https://www.hack-trip.com" />
                <meta property="og:image:url" content="https://www.hack-trip.com" />
                <meta property="og:type" content="website" />
                <meta property="og:description"
                    content="Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!" />
                <meta property="quote" content={'Hack Trip'} />
                <meta property="og:locale" content="en_US" />
                <meta property="og:hashtag" content={'#HackTrip'} />
                <meta property="og:site_name" content="Hack-Trip" />
                <link rel="canonical" href="/term-privacy-policy" />
            </Helmet>
            <Grid container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', padding: '0', margin: '0', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', maxWidth: '80%' }}>
                    <h1 >Welcome in hack trip.</h1>

                    <div >

                        <ul style={{ listStyleType: 'none' }} onClick={handleClick}>

                            <li>
                                <h2 style={{ cursor: 'pointer' }} className='term-of-use'>Terms of use</h2>
                            </li>
                            <li>
                                <h2>and</h2>
                            </li>

                            <li >
                                <h2 style={{ cursor: 'pointer' }} className='privacy-policy'>privacy policy.</h2>
                            </li>
                        </ul>

                    </div>

                    <h2 id='term-of-use'>Terms and conditions</h2>
                    <p>These terms and conditions (&#8220;Agreement&#8221;) set forth the general terms and conditions of your use of the <a href="https://www.hack-trip.com">hack-trip.com</a> website (&#8220;Website&#8221; or &#8220;Service&#8221;) and any of its related products and services (collectively, &#8220;Services&#8221;). This Agreement is legally binding between you (&#8220;User&#8221;, &#8220;you&#8221; or &#8220;your&#8221;) and this Website operator (&#8220;Operator&#8221;, &#8220;we&#8221;, &#8220;us&#8221; or &#8220;our&#8221;). If you are entering into this agreement on behalf of a business or other legal entity, you represent that you have the authority to bind such entity to this agreement, in which case the terms &#8220;User&#8221;, &#8220;you&#8221; or &#8220;your&#8221; shall refer to such entity. If you do not have such authority, or if you do not agree with the terms of this agreement, you must not accept this agreement and may not access and use the Website and Services. By accessing and using the Website and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement. You acknowledge that this Agreement is a contract between you and the Operator, even though it is electronic and is not physically signed by you, and it governs your use of the Website and Services.</p>
                    <div className="wpembed-toc">
                        <h3>Table of contents</h3>
                        <ol className="wpembed-toc" onClick={handleClick}>
                            <li style={{ cursor: 'pointer' }} className='accounts-and-membership'>Accounts and membership</li>
                            <li style={{ cursor: 'pointer' }} className="user-content">User content</li>
                            <li style={{ cursor: 'pointer' }} className='backups'>Backups</li>
                            <li style={{ cursor: 'pointer' }} className='links-to-other-resources'>Links to other resources</li>
                            <li style={{ cursor: 'pointer' }} className='prohibited-uses'>Prohibited uses</li>
                            <li style={{ cursor: 'pointer' }} className='intellectual-property-rights'>Intellectual property rights</li>
                            <li style={{ cursor: 'pointer' }} className='limitation-of-liability'>Limitation of liability</li>
                            <li style={{ cursor: 'pointer' }} className='indemnification'>Indemnification</li>
                            <li style={{ cursor: 'pointer' }} className='severability'>Severability</li>
                            <li style={{ cursor: 'pointer' }} className='dispute-resolution'>Dispute resolution</li>
                            <li style={{ cursor: 'pointer' }} className='changes-and-amendments'>Changes and amendments</li>
                            <li style={{ cursor: 'pointer' }} className='acceptance-of-these-terms'>Acceptance of these terms</li>
                            <li style={{ cursor: 'pointer' }} className='contacting-us'>Contacting us</li>
                        </ol>
                    </div>
                    <h2 id="accounts-and-membership">Accounts and membership</h2>
                    <p>You must be at least 18 years of age to use the Website and Services. By using the Website and Services and by agreeing to this Agreement you warrant and represent that you are at least 18 years of age. If you create an account on the Website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it. We may, but have no obligation to, monitor and review new accounts before you may sign in and start using the Services. Providing false contact information of any kind may result in the termination of your account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security. We will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions. We may suspend, disable, or delete your account (or any part thereof) if we determine that you have violated any provision of this Agreement or that your conduct or content would tend to damage our reputation and goodwill. If we delete your account for the foregoing reasons, you may not re-register for our Services. We may block your email address and Internet protocol address to prevent further registration.</p>
                    <h2 id="user-content">User content</h2>
                    <p>We do not own any data, information or material (collectively, &#8220;Content&#8221;) that you submit on the Website in the course of using the Service. You shall have sole responsibility for the accuracy, quality, integrity, legality, reliability, appropriateness, and intellectual property ownership or right to use of all submitted Content. We may, but have no obligation to, monitor and review the Content on the Website submitted or created using our Services by you. You grant us permission to access, copy, distribute, store, transmit, reformat, display and perform the Content of your user account solely as required for the purpose of providing the Services to you. Without limiting any of those representations or warranties, we have the right, though not the obligation, to, in our own sole discretion, refuse or remove any Content that, in our reasonable opinion, violates any of our policies or is in any way harmful or objectionable. Unless specifically permitted by you, your use of the Website and Services does not grant us the license to use, reproduce, adapt, modify, publish or distribute the Content created by you or stored in your user account for commercial, marketing or any similar purpose.</p>
                    <h2 id="backups">Backups</h2>
                    <p>We are not responsible for the Content residing on the Website. In no event shall we be held liable for any loss of any Content. It is your sole responsibility to maintain appropriate backup of your Content. Notwithstanding the foregoing, on some occasions and in certain circumstances, with absolutely no obligation, we may be able to restore some or all of your data that has been deleted as of a certain date and time when we may have backed up data for our own purposes. We make no guarantee that the data you need will be available.</p>
                    <h2 id="links-to-other-resources">Links to other resources</h2>
                    <p>Although the Website and Services may link to other resources (such as websites, mobile applications, etc.), we are not, directly or indirectly, implying any approval, association, sponsorship, endorsement, or affiliation with any linked resource, unless specifically stated herein. We are not responsible for examining or evaluating, and we do not warrant the offerings of, any businesses or individuals or the content of their resources. We do not assume any responsibility or liability for the actions, products, services, and content of any other third parties. You should carefully review the legal statements and other conditions of use of any resource which you access through a link on the Website. Your linking to any other off-site resources is at your own risk.</p>
                    <h2 id="prohibited-uses">Prohibited uses</h2>
                    <p>In addition to other terms as set forth in the Agreement, you are prohibited from using the Website and Services or Content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Website and Services, third party products and services, or the Internet; (h) to spam, phish, pharm, pretext, spider, crawl, or scrape; (i) for any obscene or immoral purpose; or (j) to interfere with or circumvent the security features of the Website and Services, third party products and services, or the Internet. We reserve the right to terminate your use of the Website and Services for violating any of the prohibited uses.</p>
                    <h2 id="intellectual-property-rights">Intellectual property rights</h2>
                    <p>&#8220;Intellectual Property Rights&#8221; means all present and future rights conferred by statute, common law or equity in or in relation to any copyright and related rights, trademarks, designs, patents, inventions, goodwill and the right to sue for passing off, rights to inventions, rights to use, and all other intellectual property rights, in each case whether registered or unregistered and including all applications and rights to apply for and be granted, rights to claim priority from, such rights and all similar or equivalent rights or forms of protection and any other results of intellectual activity which subsist or will subsist now or in the future in any part of the world. This Agreement does not transfer to you any intellectual property owned by the Operator or third parties, and all rights, titles, and interests in and to such property will remain (as between the parties) solely with the Operator. All trademarks, service marks, graphics and logos used in connection with the Website and Services, are trademarks or registered trademarks of the Operator or its licensors. Other trademarks, service marks, graphics and logos used in connection with the Website and Services may be the trademarks of other third parties. Your use of the Website and Services grants you no right or license to reproduce or otherwise use any of the Operator or third party trademarks.</p>
                    <h2 id="limitation-of-liability">Limitation of liability</h2>
                    <p>To the fullest extent permitted by applicable law, in no event will the Operator, its affiliates, directors, officers, employees, agents, suppliers or licensors be liable to any person for any indirect, incidental, special, punitive, cover or consequential damages (including, without limitation, damages for lost profits, revenue, sales, goodwill, use of content, impact on business, business interruption, loss of anticipated savings, loss of business opportunity) however caused, under any theory of liability, including, without limitation, contract, tort, warranty, breach of statutory duty, negligence or otherwise, even if the liable party has been advised as to the possibility of such damages or could have foreseen such damages. To the maximum extent permitted by applicable law, the aggregate liability of the Operator and its affiliates, officers, employees, agents, suppliers and licensors relating to the services will be limited to an amount no greater than one dollar or any amounts actually paid in cash by you to the Operator for the prior one month period prior to the first event or occurrence giving rise to such liability. The limitations and exclusions also apply if this remedy does not fully compensate you for any losses or fails of its essential purpose.</p>
                    <h2 id="indemnification">Indemnification</h2>
                    <p>You agree to indemnify and hold the Operator and its affiliates, directors, officers, employees, agents, suppliers and licensors harmless from and against any liabilities, losses, damages or costs, including reasonable attorneys&#8217; fees, incurred in connection with or arising from any third party allegations, claims, actions, disputes, or demands asserted against any of them as a result of or relating to your Content, your use of the Website and Services or any willful misconduct on your part.</p>
                    <h2 id="severability">Severability</h2>
                    <p>All rights and restrictions contained in this Agreement may be exercised and shall be applicable and binding only to the extent that they do not violate any applicable laws and are intended to be limited to the extent necessary so that they will not render this Agreement illegal, invalid or unenforceable. If any provision or portion of any provision of this Agreement shall be held to be illegal, invalid or unenforceable by a court of competent jurisdiction, it is the intention of the parties that the remaining provisions or portions thereof shall constitute their agreement with respect to the subject matter hereof, and all such remaining provisions or portions thereof shall remain in full force and effect.</p>
                    <h2 id="dispute-resolution">Dispute resolution</h2>
                    <p>The formation, interpretation, and performance of this Agreement and any disputes arising out of it shall be governed by the substantive and procedural laws of Bulgaria without regard to its rules on conflicts or choice of law and, to the extent applicable, the laws of Bulgaria. The exclusive jurisdiction and venue for actions related to the subject matter hereof shall be the courts located in Bulgaria, and you hereby submit to the personal jurisdiction of such courts. You hereby waive any right to a jury trial in any proceeding arising out of or related to this Agreement. The United Nations Convention on Contracts for the International Sale of Goods does not apply to this Agreement.</p>
                    <h2 id="changes-and-amendments">Changes and amendments</h2>
                    <p>We reserve the right to modify this Agreement or its terms related to the Website and Services at any time at our discretion. When we do, we will revise the updated date at the bottom of this page. We may also provide notice to you in other ways at our discretion, such as through the contact information you have provided.</p>
                    <p>An updated version of this Agreement will be effective immediately upon the posting of the revised Agreement unless otherwise specified. Your continued use of the Website and Services after the effective date of the revised Agreement (or such other act specified at that time) will constitute your consent to those changes.</p>
                    <h2 id="acceptance-of-these-terms">Acceptance of these terms</h2>
                    <p>You acknowledge that you have read this Agreement and agree to all its terms and conditions. By accessing and using the Website and Services you agree to be bound by this Agreement. If you do not agree to abide by the terms of this Agreement, you are not authorized to access or use the Website and Services. This terms and conditions policy was created with the help of <a href="https://www.websitepolicies.com" target="_blank" rel="noopener noreferrer">WebsitePolicies</a>.</p>
                    <h2 id="contacting-us">Contacting us</h2>
                    <p>If you have any questions, concerns, or complaints regarding this Agreement, we encourage you to contact us using the details below:</p>
                    <p>&#119;&#119;w&#46;ha&#99;k&#46;&#116;&#114;&#105;p&#64;&#103;&#109;&#97;&#105;&#108;&#46;c&#111;m</p>
                    <p>This document was last updated on March 24, 2023</p>
                    <p className="madewith"><a href="https://www.websitepolicies.com/?via=madewithbadge" target="_blank" rel="noopener noreferrer"><img width="200" height="25" alt="Made with WebsitePolicies" src="https://cdn.websitepolicies.io/img/badge.png" srcSet="https://cdn.websitepolicies.io/img/badge_2x.png 2x" /></a></p>

                    <h2 id='privacy-policy'>Privacy Policy</h2>
                    <p>Last Updated: 24.03.2023.
                        This Privacy Policy (“Policy”) explains the information collection, use, and sharing practices of https://www.hack-trip.com (“we,” “us,” and “our”).
                        Unless otherwise stated, this Policy describes and governs the information collection, use, and sharing practices of https://www.hack-trip.com with respect to your use of our website (https://www.hack-trip.com) and the services (“Services”) we provide and/or host on our servers.
                        Before you use or submit any information through or in connection with the Services, please carefully review this Privacy Policy. By using any part of the Services, you understand that your information will be collected, used, and disclosed as outlined in this Privacy Policy.
                        If you do not agree to this privacy policy, please do not use our Services.</p>
                    <h3>Our Principles</h3>
                    <p>https://www.hack-trip.com has designed this policy to be consistent with the following principles:</p>
                    <ul>
                        <li>https://www.hack-trip.com has designed this policy to be consistent with the following principles:</li>
                        <li>Data collection, storage, and processing should be simplified as much as possible to enhance security, ensure consistency, and make the practices easy for users to understand. </li>
                        <li>Data practices should meet the reasonable expectations of users. </li>
                    </ul>
                    <h3>
                        Information We Collect
                    </h3>
                    <p>
                        We collect information in multiple ways, including when you provide information directly to us; when we passively collect information from you, such as from your browser or device; and from third parties.
                    </p>
                    <h3>Information You Provide Directly to Us</h3>
                    <p>
                        We will collect any information you provide to us. We may collect information from you in a variety of ways, such as when you: (a) create an online account, (b) make a donation or purchase, (c) contact us or provide feedback, (d) subscribe to our newsletter, or (e) subscribe to our newsletter. This information may include but is not limited to your name, email address, phone number, mailing address, payment information and your geographic location.
                    </p>
                    <h3>
                        Information that Is Automatically Collected
                    </h3>
                    <p>
                        Device/Usage Information
                    </p>
                    <p>
                        We may automatically collect certain information about the computer or devices (including mobile devices or tablets) you use to access the Services. As described further below, we may collect and analyze (a) device information such as IP addresses, location information (by country and city), unique device identifiers, IMEI and TCP/IP address, browser types, browser language, operating system, mobile device carrier information, and (b) information related to the ways in which you interact with the Services, such as referring and exit web pages and URLs, platform type, the number of clicks, domain names, landing pages, pages and content viewed and the order of those pages, statistical information about the use of the Services, the amount of time spent on particular pages, the date and time you used the Services, the frequency of your use of the Services, error logs, and other similar information. As described further below, we may use third-party analytics providers and technologies, including cookies and similar tools, to assist in collecting this information.
                    </p>
                    <p>Cookies and Other Tracking Technologies</p>
                    <p>We also collect data about your use of the Services through the use of Internet server logs and online tracking technologies, like cookies and/or tracking pixels. A web server log is a file where website activity is stored. A cookie is a small text file that is placed on your computer when you visit a website, that enables us to: (a) recognize your computer; (b) store your preferences and settings; (c) understand the web pages of the Services you have visited and the referral sites that have led you to our Services; (d) enhance your user experience by delivering content  specific to your inferred interests; (e) perform searches and analytics; and (f) assist with security administrative functions. Tracking pixels (sometimes referred to as web beacons or clear GIFs) are tiny electronic tags with a unique identifier embedded in websites, online ads and/or email, and that are designed to provide usage information like ad impressions or clicks, measure popularity of the Services and associated advertising, and to access user cookies. We may also use tracking technologies in our license buttons and/or icons that you can embed on other sites/services to track the website addresses where they are embedded, gauge user interaction with them, and determine the number of unique viewers of them. If you receive email from us (such as the CC newsletter, campaign updates, or other ongoing email communications from CC), we may use certain analytics tools, such as clear GIFs, to capture data such as whether you open our message, click on any links or banners our email contains, or otherwise interact with what we send. This data allows us to gauge the effectiveness of our communications and marketing campaigns.  As we adopt additional technologies, we may also gather additional information through other methods.
                        Please note that you can change your settings to notify you when a cookie is being set or updated, or to block cookies altogether. Please consult the “Help” section of your browser for more information. Please note that by blocking any or all cookies, you may not have access to certain features or offerings of the Services.
                        For more information about how we use cookies, please read our Cookie Policy.</p>
                    <h3>Information from Third Parties</h3>
                    <p>the extent permitted by law, we may also collect information from third parties, including public sources, social media platforms, and marketing and market research firms. Depending on the source, this information collected from third parties could include name, contact information, demographic information, information about an individual’s employer, information to verify identity or trustworthiness, and information for other fraud or safety protection purposes.</p>
                    <h3>How We Use Your Information</h3>
                    <p>We may use the information we collect from and about you to:</p>
                    <ul>
                        <li>Fulfill the purposes for which you provided it. </li>
                        <li>Provide and improve the Services, including to develop new features or services, take steps to secure the Services, and for technical and customer support. </li>
                        <li>Fundraise, accept donations, or process transactions. </li>
                        <li>Send you information about your interaction or transactions with us, account alerts, or other communications, such as newsletters to which you have subscribed. </li>
                        <li>Process and respond to your inquiries or to request your feedback. </li>
                        <li>Conduct analytics, research, and reporting, including to synthesize and derive insights from your use of our Services. </li>
                        <li>Comply with the law and protect the safety, rights, property, or security of https://www.hack-trip.com, the Services, our users, and the general public; and </li>
                        <li>Enforce our Terms of Use, including to investigate potential violations thereof. </li>
                    </ul>
                    <p>Please note that we may combine information that we collect from you and about you (including automatically collected information) with information we obtain about you from our affiliates and/or non-affiliated third parties, and use such combined information in accordance with this Privacy Policy.
                        We may aggregate and/or de-identify information collected through the Services. We may use de-identified and/or aggregated data for any purpose, including without limitation for research and marketing purposes.</p>
                    <h3>When We Disclose Your Information</h3>
                    <p>
                        We may disclose and/or share your information under the following circumstances:
                    </p>
                    <h4>Service Providers.</h4>
                    <p>
                        We may disclose your information with third parties who perform services on our behalf, including without limitation, event management, marketing, customer support, data storage, data analysis and processing, and legal services.
                    </p>
                    <h4>Legal Compliance and Protection of Creative Commons and Others.</h4>
                    <p>
                        We may disclose your information if required to do so by law or on a good faith belief that such disclosure is permitted by this Privacy Policy or reasonably necessary or appropriate for any of the following reasons: (a) to comply with legal process; (b) to enforce or apply our Terms of Use and this Privacy Policy, or other contracts with you, including investigation of potential violations thereof; (c) enforce our Charter including the Code of Conduct and policies contained and incorporated therein, (d) to respond to your requests for customer service; and/or (e) to protect the rights, property, or personal safety of https://www.hack-trip.com, our agents and affiliates, our users, and the public. This includes exchanging information with other companies and organizations for fraud protection, and spam/malware prevention, and similar purposes.
                    </p>
                    <h4>Business Transfers.</h4>
                    <p>
                        As we continue to develop our business, we may engage in certain business transactions, such as the transfer or sale of our assets. In such transactions, (including in contemplation of such transactions, e.g., due diligence) your information may be disclosed. If any of our assets are sold or transferred to a third party, customer information (including your email address) would likely be one of the transferred business assets.
                    </p>
                    <h4>
                        Affiliated Companies.
                    </h4>
                    <p>
                        We may disclose your information with current or future affiliated companies.
                    </p>
                    <h4>
                        Consent.
                    </h4>
                    <p>
                        We may disclose your information to any third parties based on your consent to do so.
                    </p>
                    <h4>
                        Aggregate/De-identified Information.
                    </h4>
                    <p>
                        We may disclose de-identified and/or aggregated data for any purpose to third parties, including advertisers, promotional partners, and/or others.
                    </p>
                    <h4>
                        Legal Basis for Processing Personal Data
                    </h4>
                    <p>
                        The laws in some jurisdictions require companies to tell you about the legal ground they rely on to use or disclose information that can be directly linked to or used to identify you. To the extent those laws apply, our legal grounds for processing such information are as follows:
                    </p>
                    <h4>
                        To Honor Our Contractual Commitments to You.
                    </h4>
                    <p>
                        Much of our processing of information is to meet our contractual obligations to provide services to our users.
                    </p>
                    <h4>Legitimate Interests.</h4>
                    <p>
                        In many cases, we handle information on the ground that it furthers our legitimate interests in ways that are not overridden by the interests or fundamental rights and freedoms of the affected individuals, these include:
                    </p>
                    <ul>
                        <li>
                            Customer service
                        </li>
                        <li>
                            Marketing, advertising, and fundraising
                        </li>
                        <li>
                            Protecting our users, personnel, and property
                        </li>
                        <li>
                            Managing user accounts
                        </li>
                        <li>
                            Organizing and running events and programs
                        </li>
                        <li>
                            Analyzing and improving our business
                        </li>
                        <li>
                            Managing legal issues
                        </li>
                    </ul>

                    <p>
                        We may also process information for the same legitimate interests of our users and business partners.
                    </p>
                    <h4>
                        Legal Compliance.
                    </h4>
                    <p>We may need to use and disclose information in certain ways to comply with our legal obligations.</p>
                    <h4>
                        Consent.
                    </h4>
                    <p>
                        Where required by law, and in some other cases where legally permissible, we handle information on the basis of consent. Where we handle your information on the basis of consent, you have the right to withdraw your consent; in accordance with applicable law.
                    </p>
                    <h3>
                        Online Analytics
                    </h3>
                    <p>
                        We may use third-party web analytics services (such as Google Analytics) on our Services to collect and analyze the information discussed above, and to engage in auditing, research, or reporting. The information (including your IP address) collected by various analytics technologies described in the “Cookies and Other Tracking Technologies” section above will be disclosed to or collected directly by these service providers, who use the information to evaluate your use of the Services, including by noting the third-party website from which you arrive to our Site, analyzing usage trends, assisting with fraud prevention, and providing certain features to you. To prevent Google Analytics from using your information for analytics, you may install the official Google Analytics Opt-out Browser Add-on.
                    </p>
                    <h3>
                        Email Unsubscribe
                    </h3>
                    <p>
                        You may unsubscribe from our marketing emails at any time by  emailing www.hack.trip@gmail.com with your request.
                    </p>
                    <h3>
                        Account Preferences
                    </h3>
                    <p>
                        If you have registered for an account with us through our Services, you can update your account information or adjust your email communications preferences by logging into your account and updating your settings.
                    </p>
                    <h3>
                        EU Data Subject Rights
                    </h3>
                    <p>

                        Individuals in the European Economic Area (“EEA”) and other jurisdictions have certain legal rights (subject to applicable exceptions and limitations) to obtain confirmation of whether we hold certain information about them, to access such information, and to obtain its correction or deletion in appropriate circumstances. You may have the right to object to our handling of your information, restrict our processing of your information, and to withdraw any consent you have provided. To exercise these rights, please email us at www.hack.trip@gmail.com with the nature of your request. You also have the right to go directly to the relevant supervisory or legal authority, but we encourage you to contact us so that we may resolve your concerns directly as best and as promptly as we can.
                    </p>
                    <h3>
                        International Transfers
                    </h3>
                    <p>
                        As described above in the “When We Disclose Your Information” section, we may share your information with trusted service providers or business partners in countries other than your country of residence in accordance with applicable law. This means that some of your information may be processed in countries that may not offer the same level of protection as the privacy laws of your jurisdiction. By providing us with your information, you acknowledge any such transfer, storage or use.
                        If we provide any information about you to any third parties information processors located outside of the EEA, we will take appropriate measures to ensure such companies protect your information adequately in accordance with this Privacy Policy and other data protection laws to govern the transfers of such data.
                    </p>
                    <h3>
                        Security Measures
                    </h3>
                    <p>
                        We have implemented technical, physical, and organizational security measures to protect against the loss, misuse, and/or alteration of your information. These safeguards vary based on the sensitivity of the information that we collect and store. However, we cannot and do not guarantee that these measures will prevent every unauthorized attempt to access, use, or disclose your information since despite our efforts, no Internet and/or other electronic transmissions can be completely secure.
                    </p>
                    <h3>
                        Children
                    </h3>

                    <p>
                        The Services are intended for users over the age of 18 and are not directed at children under the age of 13. If we become aware that we have collected personal information (as defined by the Children’s Online Privacy Protection Act) from children under the age of 13, or personal data (as defined by the EU GDPR) from children under the age of 16, we will take reasonable steps to delete it as soon as practicable.
                    </p>
                    <h3>
                        Data Retention

                    </h3>
                    <p>
                        We retain the information we collect for as long as necessary to fulfill the purposes set forth in this Privacy Policy or as long as we are legally required or permitted to do so. Information may persist in copies made for backup and business continuity purposes for additional time.
                    </p>
                    <h3>
                        Third-Party Links and Services

                    </h3>
                    <p>
                        The Services may contain links to third-party websites (e.g., social media sites like Facebook and Twitter), third-party plug-ins (e.g., the Facebook “like” button and Twitter “follow” button), and other services. If you choose to use these sites or features, you may disclose your information not just to those third-parties, but also to their users and the public more generally depending on how their services function. Creative Commons is not responsible for the content or privacy practices of such third party websites or services. The collection, use and disclosure of your information will be subject to the privacy policies of the third party websites or services, and not this Privacy Policy. We encourage you to read the privacy statements of each and every site you visit.
                    </p>
                    <h3>
                        Changes to this Privacy Policy
                    </h3>
                    <p>
                        We will continue to evaluate this Privacy Policy as we update and expand our Services, and we may make changes to the Privacy Policy accordingly. We will post any changes here and revise the date last updated above. We encourage you to check this page periodically for updates to stay informed on how we collect, use and share your information. If we make material changes to this Privacy Policy, we will provide you with notice as required by law.
                    </p>
                    <h3>
                        Questions About this Privacy Policy
                    </h3>
                    <p>
                        If you have any questions about this Privacy Policy or our privacy practices, you can contact us at: www.hack.trip@gmail.com.
                    </p>

                    <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '20px', background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>

                </Box>

            </Grid>
        </>

    )
}


export default TermPrivacy;