import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Zetra Electronics',
    description: 'Privacy Policy and Data Handling for Zetra Electronics.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Privacy Policy</h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        At Zetra Electronics, we collect information that you manually provide to us (such as your name, email, billing/shipping address, and payment information) when making purchases, subscribing to newsletters, or contacting our technical support team. We also gather automated metrics such as IP addresses, browsing behavior, and device type to help optimize our e-commerce platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Data</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        The primary purpose of collecting your information is to fulfill and ship your orders for electronic components accurately. We may also use your data to send you important order updates, dispatch tracking codes, run fraud detection protocols, and occasionally inform you about new modules or robotics kits that might interest you.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Sharing</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        We do not sell your personal data to any third-party brokers. However, your data is shared with essential third-party service providers required to operate our business. These include shipping couriers (to deliver your boards and sensors) and secure payment gateways (to process your checkout).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cybersecurity and Protection</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Our store utilizes secure, encrypted connections (SSL/TLS) for all transactions to ensure your data stays private. As an electronics and technology company, we prioritize safeguarding our servers and your account credentials from unauthorized access. We do not store full credit card details on our local servers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies and Tracking</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        We use cookies to maintain your active shopping cart, keep you logged into your profile, and analyze site traffic to improve our interface. You have the ability to decline non-essential cookies through your browser settings, though doing so may prevent certain site features from operating properly.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Depending on your jurisdiction, you may hold the right to access, edit, or request the deletion of your personal information stored in our database. You can manage your account information directly from the 'My Account' page, or contact our support team to initiate a data request.
                    </p>
                </section>

                <p className="text-sm text-slate-500 mt-12 pt-8 border-t">
                    Last Updated: March 2026<br />
                    For inquiries regarding this Privacy Policy, please email support@zetraelectronics.com.
                </p>
            </div>
        </div>
    );
}
