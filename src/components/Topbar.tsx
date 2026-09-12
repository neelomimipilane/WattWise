import { Menu, LogIn, LogOut, UserPlus } from 'lucide-react'
import { useWattWise } from '../context/WattWiseContext'
import { PrimaryButton } from './ui'

interface TopbarProps {
  onMenu: () => void
  title: string
  showMenu?: boolean
}

export function Topbar({ onMenu, title, showMenu = false }: TopbarProps) {
  const { currentUser, setView, logout } = useWattWise()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        {showMenu && (
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-border p-2 text-deep-blue lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        )}
        <div>
          {title ? (
            <h1 className="font-display text-lg font-bold text-deep-blue sm:text-xl">{title}</h1>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {currentUser ? (
          <>
            <span className="hidden text-xs font-semibold text-dark-text/65 sm:inline">
              {currentUser.role === 'company'
                ? currentUser.companyName || currentUser.name
                : currentUser.name}
            </span>
            <PrimaryButton variant="ghost" className="!px-3 !py-2" onClick={logout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton variant="ghost" className="!px-3 !py-2" onClick={() => setView('login')}>
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Sign in</span>
            </PrimaryButton>
            <PrimaryButton variant="accent" className="!px-3 !py-2" onClick={() => setView('register')}>
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Register</span>
            </PrimaryButton>
          </>
        )}
      </div>
    </header>
  )
}
