/**
 * @file Default page rendered at the application root URL.
 * Sections: home-page content and layout.
 * Keep module-specific workflows in their feature folders.
 */
import Card from '../components/ui/Card'

function HomePage() {
  return (
    <div className={'mx-auto max-w-screen-2xl'}>
      <Card>
        <h1 className={'text-lg font-semibold text-app-text'}>Welcome to our ERP Software</h1>
        <p className={'mt-1 text-app-muted'}>
          Choose a module from the navigation drawer to get started.
        </p>
      </Card>
      
    </div>
    
  )
}

export default HomePage
