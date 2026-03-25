import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Zetra Electronics',
    description: 'Terms of Service and User Agreement for Zetra Electronics.',
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Terms of Service</h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        By accessing and using the Zetra Electronics website and services ("Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not accept these terms, please do not use our Services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Products and Availability</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        All electronic components, boards, sensors, and robotics kits are subject to availability. We reserve the right to discontinue any product at any time or change pricing without prior notice. We make every effort to display the colors and specifications of our products accurately, but we cannot guarantee that your device's display will be completely accurate.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        When you create an account with us, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. Zetra Electronics reserves the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Shipping and Delivery</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        We aim to process and ship orders promptly. However, delivery times are estimates and may vary depending on courier services and your location. Zetra Electronics is not liable for indirect or consequential losses resulting from delivery delays.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Returns and Refunds</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Due to the sensitive nature of electronic components and development boards, returns are only accepted for defective items within 7 days of delivery. Components that have been soldered, programmed, or physically modified cannot be returned unless proven to be suffering from a manufacturing defect.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Liability Limitation</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Zetra Electronics provides products primarily for educational, prototyping, and hobbyist purposes. We shall not be held liable for any damages, personal injury, or equipment failure resulting from the misuse, improper circuit wiring, or integration of our products into critical or life-support systems.
                    </p>
                </section>

                <p className="text-sm text-slate-500 mt-12 pt-8 border-t">
                    Last Updated: March 2026<br />
                    If you have any questions about these Terms, please contact us at support@zetraelectronics.com.
                </p>
            </div>
        </div>
    );
}
