export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 md:p-16 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: July 2026</p>
        
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
          <p>
            When you use our Instagram Analytics Dashboard, we collect the minimum amount of information necessary to provide you with analytics services. This includes your Instagram account metadata, media statistics, and public profile information accessed via the Instagram Graph API.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>
            The data collected from the Instagram Graph API is used solely for the purpose of displaying analytics, generating insights, and providing chat-based metrics within your dashboard. We do not sell, rent, or share this data with third-party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. Data Retention and Deletion</h2>
          <p>
            We retain your analytics data as long as your account is active. If you wish to delete your data, you can disconnect your Instagram account or delete your account entirely from the dashboard settings, which will promptly remove your Instagram Graph API access tokens and associated cached data from our servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
          <p>
            We use Supabase for authentication and database storage. We also use third-party AI providers (such as OpenAI, Anthropic, Google, or your custom provider) to generate insights from your analytics data. Only aggregate numerical data and metrics are sent to these AI providers to generate your insights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact the repository administrator.
          </p>
        </section>
      </div>
    </div>
  );
}
