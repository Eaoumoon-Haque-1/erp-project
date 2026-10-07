/**
 * @file Application shell shared by all routed pages.
 * Sections: drawer state, responsive toggle behavior, navbar/sidebar, Outlet workspace, and footer.
 * Keep feature business logic out of the root layout.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DrawerSidebar from '../components/shared_layout/DrawerSidebar'
import Footer from '../components/shared_layout/Footer'
import Navbar from '../components/shared_layout/Navbar'

function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)

  const handleDrawerToggle = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setDrawerCollapsed((isCollapsed) => !isCollapsed)
      return
    }

    setDrawerOpen((isOpen) => !isOpen)
  }

  return (
    <div className={'flex min-h-screen flex-col bg-app-background'}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <div className={'relative flex min-h-0 flex-1 overflow-hidden'}>
        <DrawerSidebar
          open={drawerOpen}
          collapsed={drawerCollapsed}
          onNavigate={() => setDrawerOpen(false)}
        />
        {drawerOpen && (
          <button
            type={'button'}
            className={'fixed inset-0 top-14 z-20 bg-black/30 lg:hidden'}
            aria-label={'Close navigation drawer'}
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <main className={'workspace-content min-w-0'}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default RootLayout
