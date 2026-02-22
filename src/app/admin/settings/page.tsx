import { createClient } from "@/lib/supabase/server";
import { updateSetting } from "./actions";

interface SystemSetting {
    key: string;
    value: string | null;
    description: string | null;
}

export default async function AdminSettingsPage() {
    const supabase = await createClient();
    const { data: settings } = await supabase.from("system_settings").select("*").order("key", { ascending: true });

    if (!settings || settings.length === 0) {
        return (
            <div className="max-w-2xl bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                No settings available. Please run migration <code>007_settings.sql</code> and <code>008_payment_settings.sql</code>.
            </div>
        );
    }

    const generalSettings = settings.filter(s => !s.key.startsWith('razorpay_'));
    const paymentSettings = settings.filter(s => s.key.startsWith('razorpay_'));

    return (
        <div className="max-w-3xl space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

            {/* General Settings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-md font-semibold text-gray-800">General Configuration</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {generalSettings.map((setting) => (
                        <SettingItem key={setting.key} setting={setting} />
                    ))}
                </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-md font-semibold text-gray-800">Payment Gateway (Razorpay)</h2>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Secure</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {paymentSettings.map((setting) => (
                        <SettingItem
                            key={setting.key}
                            setting={setting}
                            isSecret={setting.key.includes('secret')}
                            isToggle={setting.key === 'razorpay_enabled'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SettingItem({ setting, isSecret = false, isToggle = false }: { setting: SystemSetting, isSecret?: boolean, isToggle?: boolean }) {
    return (
        <form className="p-6 flex items-start gap-6">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                    {setting.key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </label>
                <p className="text-xs text-gray-500 mb-3">{setting.description}</p>

                <div className="flex gap-2">
                    {isToggle ? (
                        <select
                            name="value"
                            defaultValue={setting.value || "true"}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled (Offline Mode)</option>
                        </select>
                    ) : (
                        <input
                            name="value"
                            defaultValue={setting.value || ""}
                            type={isSecret ? "password" : "text"}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                            placeholder={isSecret ? "••••••••" : ""}
                        />
                    )}
                    <button
                        formAction={async (formData: FormData) => {
                            "use server";
                            const val = formData.get("value") as string;
                            await updateSetting(setting.key, val);
                        }}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
    );
}
