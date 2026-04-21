import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon, WifiOffIcon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    // FIX: also read error from state so we can show it instead of spinning forever
    const { loading, error } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    if (loading) return (
        <div className='flex flex-col items-center justify-center h-screen bg-white dark:bg-zinc-950 gap-3'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading workspace...</p>
        </div>
    )

    // FIX: show a clear error instead of a blank/stuck screen
    if (error) return (
        <div className='flex flex-col items-center justify-center h-screen bg-white dark:bg-zinc-950 gap-4'>
            <WifiOffIcon className="size-8 text-red-400" />
            <p className="text-lg font-semibold text-zinc-800 dark:text-white">Could not connect to server</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
                Make sure your backend is running on <span className="font-mono text-blue-500">localhost:5000</span> and your database is connected.
            </p>
            <p className="text-xs text-red-400 font-mono bg-red-50 dark:bg-red-950 px-3 py-2 rounded">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-2 px-5 py-2 text-sm rounded bg-blue-500 text-white hover:opacity-90"
            >
                Retry
            </button>
        </div>
    )

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
