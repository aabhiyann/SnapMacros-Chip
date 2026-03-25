import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#09090F] text-white px-5 pb-16">
            <div className="max-w-[640px] mx-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[#09090F]/95 backdrop-blur-sm pt-12 pb-4 z-10 flex items-center gap-3 border-b border-[#2A2A3D] mb-8">
                    <Link href="/settings" className="p-2 rounded-full hover:bg-[#1C1C28] transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-['Bricolage_Grotesque'] text-[22px] font-bold">Privacy Policy</h1>
                </div>

                <p className="text-[#9898B3] font-['DM_Sans'] text-[14px] mb-8">
                    Last updated: March 25, 2026
                </p>

                <div className="space-y-8 font-['DM_Sans'] text-[15px] leading-relaxed text-[#F2F2FF]">

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">1. Information We Collect</h2>
                        <div className="space-y-3 text-[#9898B3]">
                            <p><strong className="text-white">Account information:</strong> Email address and display name when you create an account or sign in via Apple or Google.</p>
                            <p><strong className="text-white">Health and biometric data:</strong> Height, weight, age, gender, and fitness goals that you enter during onboarding to calculate your calorie and macro targets.</p>
                            <p><strong className="text-white">Nutrition logs:</strong> Food names, calorie counts, and macronutrient data for meals you log in the app.</p>
                            <p><strong className="text-white">Food photos:</strong> Images you capture or upload for AI nutrition analysis. Photos are sent to Google&apos;s Gemini AI API for processing and are not stored by SnapMacros after analysis.</p>
                            <p><strong className="text-white">Usage data:</strong> App interaction data, streak counts, and aggregated analytics to improve the product.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">2. How We Use Your Information</h2>
                        <ul className="space-y-2 text-[#9898B3] list-disc list-inside">
                            <li>Provide personalized calorie and macro targets using TDEE calculations</li>
                            <li>Generate AI-powered nutrition estimates from food photos and descriptions</li>
                            <li>Track your daily nutrition logs and streak data</li>
                            <li>Generate weekly nutrition summaries and insights</li>
                            <li>Send optional push notifications (daily reminders, weekly roasts) if you enable them</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">3. Third-Party Services</h2>
                        <div className="space-y-3 text-[#9898B3]">
                            <p><strong className="text-white">Supabase:</strong> We use Supabase for authentication and database storage. Your data is stored in Supabase&apos;s infrastructure. See <a href="https://supabase.com/privacy" className="text-[#4F9EFF] underline" target="_blank" rel="noopener noreferrer">Supabase&apos;s Privacy Policy</a>.</p>
                            <p><strong className="text-white">Google Gemini AI:</strong> Food photos and descriptions are sent to Google&apos;s Gemini AI API for nutrition analysis. See <a href="https://policies.google.com/privacy" className="text-[#4F9EFF] underline" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</p>
                            <p><strong className="text-white">Google OAuth:</strong> If you sign in with Google, we receive your email and display name from Google.</p>
                            <p><strong className="text-white">Apple Sign In:</strong> If you sign in with Apple, we receive your email (which Apple may relay) and display name from Apple.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">4. Data Retention & Deletion</h2>
                        <div className="space-y-3 text-[#9898B3]">
                            <p>Your data is retained as long as your account is active. You may delete your account at any time from the Profile &rarr; Account &rarr; Delete Account section of the app. Upon deletion:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>All nutrition logs are permanently deleted</li>
                                <li>Your profile and biometric data are permanently deleted</li>
                                <li>Your weekly roasts and summaries are permanently deleted</li>
                                <li>Your account credentials are removed from our authentication system</li>
                            </ul>
                            <p>Deletion is irreversible and takes effect immediately.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">5. Data Security</h2>
                        <p className="text-[#9898B3]">All data is transmitted over HTTPS. Your database records are protected by Supabase Row-Level Security (RLS) policies, meaning only your authenticated account can access your data. We do not sell your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">6. Children&apos;s Privacy</h2>
                        <p className="text-[#9898B3]">SnapMacros is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">7. Changes to This Policy</h2>
                        <p className="text-[#9898B3]">We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.</p>
                    </section>

                    <section>
                        <h2 className="font-['Bricolage_Grotesque'] text-[18px] font-semibold mb-3 text-white">8. Contact Us</h2>
                        <p className="text-[#9898B3]">For privacy-related questions or to request data deletion, contact us at: <a href="mailto:privacy@snapmacros.app" className="text-[#4F9EFF]">privacy@snapmacros.app</a></p>
                    </section>

                </div>
            </div>
        </main>
    );
}
