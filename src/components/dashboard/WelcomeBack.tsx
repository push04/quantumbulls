"use client";

interface WelcomeBackProps {
    userName: string;
    currentCourse?: {
        title: string;
        percentComplete: number;
    };
}

/**
 * Personalized welcome back greeting
 */
export default function WelcomeBack({ userName, currentCourse }: WelcomeBackProps) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = userName.split(' ')[0];

    return (
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {firstName}! 👋
            </h1>
            {currentCourse ? (
                <p className="text-gray-600">
                    You're <span className="font-semibold text-[#2EBD59]">{currentCourse.percentComplete}%</span> through{' '}
                    <span className="font-medium">{currentCourse.title}</span>
                </p>
            ) : (
                <p className="text-gray-600">
                    Ready to start your trading journey?
                </p>
            )}
        </div>
    );
}
