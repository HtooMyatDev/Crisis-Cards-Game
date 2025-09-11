import ComicSidebar from "@/components/ComicSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex">
            <ComicSidebar />
            <main className="flex-1 md:ml-64 min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-colors duration-200">
                    {children}
                </div>
            </main>
        </div>
    );
}
