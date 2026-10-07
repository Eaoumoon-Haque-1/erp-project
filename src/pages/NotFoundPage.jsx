/**
 * @file Catch-all page for unknown routes.
 * Sections: not-found message and safe navigation back into the app.
 * This is registered last in app/router.jsx.
 */
import Card from '../components/ui/Card'

function NotFoundPage() {
  return (
    <div className={'mx-auto max-w-screen-2xl'}>
      <Card>
        <h1 className={'text-lg font-semibold text-app-text'}>Page not found</h1>
        <p className={'mt-1 text-app-muted'}>The requested ERP page is not available.</p>
      </Card>
    </div>
  )
}

export default NotFoundPage
