export const EntryPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-5">
            <h1 className="text-3xl font-bold mb-4 text-center">Video Annotation Tool</h1>
            <nav className="mb-4">
                <ul className="flex space-x-4 justify-center">
                    <li>
                        <Link to="/" className="text-blue-500 hover:text-white hover:bg-blue-500 px-4 py-2 rounded transition duration-300 text-lg font-semibold">Home</Link>
                    </li>
                    <li>
                        <Link to="/upload" className="text-blue-500 hover:text-white hover:bg-blue-500 px-4 py-2 rounded transition duration-300 text-lg font-semibold">Upload Video</Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}