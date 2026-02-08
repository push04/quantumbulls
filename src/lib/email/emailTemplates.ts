/**
 * Email Templates
 * Defines all email templates for automation
 */

export type EmailTemplateId =
    | 'welcome'
    | 'onboarding_tips'
    | 'onboarding_success_story'
    | 'onboarding_first_course'
    | 'onboarding_upgrade'
    | 'weekly_digest'
    | 'monthly_report'
    | 're_engagement'
    | 'upsell_features'
    | 'upsell_discount'
    | 'streak_reminder'
    | 'course_complete'
    | 'level_up'
    | 'win_back';

export interface EmailTemplate {
    id: EmailTemplateId;
    subject: string;
    previewText: string;
    category: 'onboarding' | 'engagement' | 'upsell' | 'notification' | 'winback';
}

export const EMAIL_TEMPLATES: Record<EmailTemplateId, EmailTemplate> = {
    // Onboarding sequence
    welcome: {
        id: 'welcome',
        subject: 'Welcome to Quantum Bull! 🚀 Your trading journey starts here',
        previewText: 'Get started with our recommended first video',
        category: 'onboarding',
    },
    onboarding_tips: {
        id: 'onboarding_tips',
        subject: '3 Tips to Get the Most from Quantum Bull',
        previewText: 'Quick tips to accelerate your learning',
        category: 'onboarding',
    },
    onboarding_success_story: {
        id: 'onboarding_success_story',
        subject: 'How Raj doubled his returns using Quantum Bull strategies',
        previewText: 'A success story from our community',
        category: 'onboarding',
    },
    onboarding_first_course: {
        id: 'onboarding_first_course',
        subject: 'Ready for your first certificate? 🎓',
        previewText: 'Complete your first course and earn a certificate',
        category: 'onboarding',
    },
    onboarding_upgrade: {
        id: 'onboarding_upgrade',
        subject: 'Unlock 40+ more lessons with Advanced tier',
        previewText: 'Take your trading to the next level',
        category: 'onboarding',
    },

    // Engagement emails
    weekly_digest: {
        id: 'weekly_digest',
        subject: "This Week's New Lessons 📺",
        previewText: 'Fresh content added to Quantum Bull',
        category: 'engagement',
    },
    monthly_report: {
        id: 'monthly_report',
        subject: 'Your Trading Education Report for {{month}}',
        previewText: 'See how much you learned this month',
        category: 'engagement',
    },
    re_engagement: {
        id: 're_engagement',
        subject: 'We miss you! New content on {{topic}} 👋',
        previewText: "Check out what you've been missing",
        category: 'engagement',
    },
    streak_reminder: {
        id: 'streak_reminder',
        subject: "Don't break your {{streak}}-day streak! 🔥",
        previewText: 'Watch a quick lesson to maintain your streak',
        category: 'engagement',
    },

    // Upsell emails
    upsell_features: {
        id: 'upsell_features',
        subject: 'Unlock Advanced Trading Strategies 🔓',
        previewText: '20+ lessons waiting for you',
        category: 'upsell',
    },
    upsell_discount: {
        id: 'upsell_discount',
        subject: 'Exclusive: 20% off this week only! ⏰',
        previewText: 'Limited time upgrade offer',
        category: 'upsell',
    },

    // Notification emails
    course_complete: {
        id: 'course_complete',
        subject: '🎉 Congratulations! You completed {{courseName}}',
        previewText: 'Your certificate is ready',
        category: 'notification',
    },
    level_up: {
        id: 'level_up',
        subject: '🏆 You leveled up to {{level}}!',
        previewText: "You're making amazing progress",
        category: 'notification',
    },

    // Win-back
    win_back: {
        id: 'win_back',
        subject: 'Come back and get 1 month free! 🎁',
        previewText: "We'd love to have you back",
        category: 'winback',
    },
};

/**
 * Get template content (simplified - would use actual template engine)
 */
export function getTemplateContent(
    templateId: EmailTemplateId,
    data: Record<string, string | number>
): { subject: string; html: string; text: string } {
    const template = EMAIL_TEMPLATES[templateId];

    // Replace placeholders in subject
    let subject = template.subject;
    Object.entries(data).forEach(([key, value]) => {
        subject = subject.replace(`{{${key}}}`, String(value));
    });

    // Generate HTML (simplified - would use actual template engine)
    const html = generateEmailHtml(templateId, data);
    const text = generateEmailText(templateId, data);

    return { subject, html, text };
}

function generateEmailHtml(
    templateId: EmailTemplateId,
    data: Record<string, string | number>
): string {
    const userName = data.userName || 'Trader';

    // Base template structure
    const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #2EBD59; padding: 24px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Quantum Bull</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            {{CONTENT}}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px; background-color: #f9f9f9; text-align: center; font-size: 12px; color: #666;">
                            <p>© Quantum Bull Trading Education</p>
                            <p><a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    // Template-specific content
    const contents: Record<EmailTemplateId, string> = {
        welcome: `
            <h2 style="color: #333; margin-top: 0;">Welcome to Quantum Bull, ${userName}! 🚀</h2>
            <p style="color: #666; line-height: 1.6;">You've just taken the first step towards becoming a better trader.</p>
            <p style="color: #666; line-height: 1.6;">Here's what to do next:</p>
            <a href="${data.startUrl || '#'}" style="display: inline-block; background-color: #2EBD59; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Watch Your First Lesson →</a>
        `,
        onboarding_tips: `
            <h2 style="color: #333; margin-top: 0;">3 Tips to Master Your Learning</h2>
            <ol style="color: #666; line-height: 1.8;">
                <li><strong>Set a daily goal</strong> - Even 10 minutes a day adds up</li>
                <li><strong>Take notes</strong> - Use our timestamped notes feature</li>
                <li><strong>Apply immediately</strong> - Practice what you learn</li>
            </ol>
        `,
        onboarding_success_story: `
            <h2 style="color: #333; margin-top: 0;">From Beginner to Profitable Trader</h2>
            <p style="color: #666; line-height: 1.6;">"Before Quantum Bull, I was making random trades. Now I have a system."</p>
            <p style="color: #666; font-style: italic;">- Raj, Mumbai</p>
        `,
        onboarding_first_course: `
            <h2 style="color: #333; margin-top: 0;">Your First Certificate Awaits! 🎓</h2>
            <p style="color: #666; line-height: 1.6;">Complete any course to earn a professional certificate you can share on LinkedIn.</p>
        `,
        onboarding_upgrade: `
            <h2 style="color: #333; margin-top: 0;">Ready for Advanced Strategies?</h2>
            <p style="color: #666; line-height: 1.6;">Unlock 40+ premium lessons with our Advanced tier.</p>
        `,
        weekly_digest: `
            <h2 style="color: #333; margin-top: 0;">This Week's New Lessons 📺</h2>
            <p style="color: #666; line-height: 1.6;">Fresh content just for you.</p>
        `,
        monthly_report: `
            <h2 style="color: #333; margin-top: 0;">Your ${data.month || ''} Learning Report</h2>
            <p style="color: #666; line-height: 1.6;">You watched <strong>${data.videosWatched || 0}</strong> videos and learned for <strong>${data.hoursLearned || 0}</strong> hours!</p>
        `,
        re_engagement: `
            <h2 style="color: #333; margin-top: 0;">We Miss You! 👋</h2>
            <p style="color: #666; line-height: 1.6;">We've added new content on ${data.topic || 'trading strategies'}. Come back and check it out!</p>
        `,
        streak_reminder: `
            <h2 style="color: #333; margin-top: 0;">Your ${data.streak || ''}-Day Streak is at Risk! 🔥</h2>
            <p style="color: #666; line-height: 1.6;">Watch any video today to keep your streak alive.</p>
        `,
        upsell_features: `
            <h2 style="color: #333; margin-top: 0;">Unlock Your Full Potential</h2>
            <p style="color: #666; line-height: 1.6;">Join 500+ advanced traders with premium access.</p>
        `,
        upsell_discount: `
            <h2 style="color: #333; margin-top: 0;">20% Off - This Week Only! ⏰</h2>
            <p style="color: #666; line-height: 1.6;">Upgrade now and save on your subscription.</p>
        `,
        course_complete: `
            <h2 style="color: #333; margin-top: 0;">Congratulations! 🎉</h2>
            <p style="color: #666; line-height: 1.6;">You've completed <strong>${data.courseName || 'your course'}</strong>!</p>
            <a href="${data.certificateUrl || '#'}" style="display: inline-block; background-color: #2EBD59; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Download Certificate →</a>
        `,
        level_up: `
            <h2 style="color: #333; margin-top: 0;">You Leveled Up! 🏆</h2>
            <p style="color: #666; line-height: 1.6;">You're now a <strong>${data.level || ''}</strong> trader!</p>
        `,
        win_back: `
            <h2 style="color: #333; margin-top: 0;">We'd Love to Have You Back! 🎁</h2>
            <p style="color: #666; line-height: 1.6;">Come back within 30 days and get 1 month free.</p>
        `,
    };

    return baseTemplate.replace('{{CONTENT}}', contents[templateId] || '');
}

function generateEmailText(
    templateId: EmailTemplateId,
    data: Record<string, string | number>
): string {
    // Plain text version (simplified)
    return `Quantum Bull\n\n${EMAIL_TEMPLATES[templateId].subject}\n\nVisit https://quantumbull.com to learn more.`;
}
