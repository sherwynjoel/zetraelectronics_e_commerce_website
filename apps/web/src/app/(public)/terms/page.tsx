import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Zetra Electronics',
    description: 'Terms of Service and User Agreement for Zetra Electronics.',
};

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-3xl pb-16">
            <h1 className="mb-6 text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Terms of Service</h1>

            <div className="glass glass-thick grid gap-8 rounded-[var(--radius-pane)] p-6 sm:p-10">
                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">1. Acceptance of Terms</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        By accessing and using the Zetra Electronics website and services ("Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not accept these terms, please do not use our Services.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">2. Products and Availability</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        All electronic components, boards, sensors, and robotics kits are subject to availability. We reserve the right to discontinue any product at any time or change pricing without prior notice. We make every effort to display the colors and specifications of our products accurately, but we cannot guarantee that your device's display will be completely accurate.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">3. User Accounts</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        When you create an account with us, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. Zetra Electronics reserves the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">4. Shipping and Delivery</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        We aim to process and ship orders promptly. However, delivery times are estimates and may vary depending on courier services and your location. Zetra Electronics is not liable for indirect or consequential losses resulting from delivery delays.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">5. Returns and Refunds</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        Due to the sensitive nature of electronic components and development boards, returns are only accepted for defective items within 7 days of delivery. Components that have been soldered, programmed, or physically modified cannot be returned unless proven to be suffering from a manufacturing defect.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-ink">6. Liability Limitation</h2>
                    <p className="max-w-[68ch] leading-relaxed text-ink-2">
                        Zetra Electronics provides products primarily for educational, prototyping, and hobbyist purposes. We shall not be held liable for any damages, personal injury, or equipment failure resulting from the misuse, improper circuit wiring, or integration of our products into critical or life-support systems.
                    </p>
                </section>

                <p className="border-t border-line pt-6 text-sm text-ink-3">
                    Last Updated: March 2026<br />
                    If you have any questions about these Terms, please contact us at support@zetraelectronics.com.
                </p>
            </div>
        </div>
    );
}
