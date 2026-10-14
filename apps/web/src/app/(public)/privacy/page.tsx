import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Zetra Electronics',
    description: 'Privacy Policy and Data Handling for Zetra Electronics.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl pb-16">
            <h1 className="mb-6 text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Privacy Policy</h1>

            <div className="glass glass-thick grid gap-8 rounded-[var(--radius-pane)] p-6 sm:p-10">
                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">1. Information We Collect</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        At Zetra Electronics, we collect information that you manually provide to us (such as your name, email, billing/shipping address, and payment information) when making purchases, subscribing to newsletters, or contacting our technical support team. We also gather automated metrics such as IP addresses, browsing behavior, and device type to help optimize our e-commerce platform.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">2. How We Use Your Data</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        The primary purpose of collecting your information is to fulfill and ship your orders for electronic components accurately. We may also use your data to send you important order updates, dispatch tracking codes, run fraud detection protocols, and occasionally inform you about new modules or robotics kits that might interest you.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">3. Data Sharing</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        We do not sell your personal data to any third-party brokers. However, your data is shared with essential third-party service providers required to operate our business. These include shipping couriers (to deliver your boards and sensors) and secure payment gateways (to process your checkout).
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">4. Cybersecurity and Protection</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        Our store utilizes secure, encrypted connections (SSL/TLS) for all transactions to ensure your data stays private. As an electronics and technology company, we prioritize safeguarding our servers and your account credentials from unauthorized access. We do not store full credit card details on our local servers.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">5. Cookies and Tracking</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        We do not use tracking or advertising cookies. Your cart, sign-in session and theme choice are kept in your browser&apos;s local storage so the site works. Clearing your browser data removes them, which signs you out and empties your cart.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">6. Your Rights</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        Depending on your jurisdiction, you may hold the right to access, edit, or request the deletion of your personal information stored in our database. You can manage your account information directly from the &apos;My Account&apos; page, or contact our support team to initiate a data request.
                    </p>
                </section>

                <p className="border-t border-line pt-6 text-sm text-ink-3">
                    Last Updated: March 2026<br />
                    For inquiries regarding this Privacy Policy, please email support@zetraelectronics.com.
                </p>
            </div>
        </div>
    );
}
