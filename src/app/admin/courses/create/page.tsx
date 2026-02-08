import CourseForm from "../CourseForm";

export default function CreateCoursePage() {
    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Course</h1>
            <CourseForm />
        </div>
    );
}
