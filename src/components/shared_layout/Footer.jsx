/**
 * @file Shared application-layout component: Footer.
 * Sections: layout-specific helpers/state and rendered navigation or shell markup.
 * Preserve responsive desktop/mobile behavior and keep feature logic out of layout components.
 */
function Footer() {
  return (
    <footer className={'flex h-10 items-center justify-end border-t border-slate-200 bg-white px-4 text-slate-600'}>
      <span>Cloud ERP</span>
    </footer>
  )
}

export default Footer
