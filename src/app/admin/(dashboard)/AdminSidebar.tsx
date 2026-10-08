'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Settings, ShieldAlert,
  CircleDollarSign, Receipt, MessageSquare, Package,
  ChevronRight, ChevronLeft, Sun, Moon, Menu, LifeBuoy, FileText, Camera
} from 'lucide-react'
import LogoutButton from './LogoutButton'
import DentalLogo from '@/components/DentalLogo'
import { useTheme } from '@/components/ThemeContext'

const NAV_ITEMS = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard & Appts' },
  { href: '/admin/doctors',    icon: Users,           label: 'Doctor Roster' },
  { href: '/admin/finances',   icon: CircleDollarSign,label: 'Finances & Revenue' },
  { href: '/admin/inventory',  icon: Package,         label: 'Inventory & Stock' },
  { href: '/admin/complaints', icon: LifeBuoy,        label: 'Complaints & Support' },
  { href: '/admin/messaging',  icon: MessageSquare,   label: 'Patient Messaging' },
  { href: '/admin/settings',   icon: Settings,        label: 'System Settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Mobile layout state
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed') === 'true'
    setIsCollapsed(saved)
    setMounted(true)

    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem('admin_sidebar_collapsed', String(nextState))
  }

  if (!mounted) return null

  return (
    <>
      {/* Mobile Floating Hamburger Button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: 49,
            width: 44,
            height: 44,
            borderRadius: 14,
            background: '#4A5D23',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(74, 93, 35, 0.3)',
            cursor: 'pointer',
            border: 'none'
          }}
          className="hover:scale-105 active:scale-95 transition-all"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(44, 51, 37, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 48,
            }}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Capsule Sidebar */}
      <motion.aside
        initial={isMobile ? { x: -260 } : false}
        animate={
          isMobile
            ? { x: isMobileOpen ? 0 : -260, width: 260, borderRadius: 24 }
            : { x: 0, width: isCollapsed ? 80 : 260, borderRadius: isCollapsed ? 60 : 24 }
        }
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="admin-sidebar"
        style={{
          backgroundColor: '#FFFFFF',
          margin: isMobile ? 0 : 16,
          height: isMobile ? '100vh' : 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? 0 : 16,
          left: 0,
          zIndex: 50,
          overflow: 'hidden',
          border: '1px solid #E4E7D3',
          boxShadow: '4px 0 28px rgba(74, 93, 35, 0.06)',
        }}
      >
        {/* Sticky Header Logo (Does NOT scroll out) */}
        <div
          style={{
            height: 68,
            borderBottom: '1px solid #F4F6F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',
            paddingLeft: isCollapsed ? 18 : 20,
            paddingRight: 20,
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #4A5D23 0%, #6B823E 100%)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(74, 93, 35, 0.2)',
                flexShrink: 0,
              }}
            >
              <DentalLogo size={22} />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3325', lineHeight: 1.2, fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
                    Dental Admin
                  </div>
                  <div style={{ fontSize: 9, color: '#8A9380', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Clinical Console
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scrollable Navigation Container (Hidden Scrollbar) */}
        <div
          className="admin-nav-scroll"
          style={{
            position: 'relative',
            zIndex: 1,
            overflowY: 'auto',
            flex: 1,
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx global>{`
            .admin-nav-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Navigation Items */}
          <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => isMobile && setIsMobileOpen(false)}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingTop: 10,
                      paddingBottom: 10,
                      paddingLeft: isCollapsed ? 14 : 12,
                      paddingRight: 12,
                      borderRadius: 14,
                      cursor: 'pointer',
                      background: active ? '#E4E7D3' : 'transparent',
                      transition: 'background 0.2s ease',
                      overflow: 'hidden',
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Icon container */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: active ? '#4A5D23' : '#F4F6F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxShadow: active ? '0 4px 10px rgba(74, 93, 35, 0.25)' : 'none',
                        zIndex: 1,
                      }}
                    >
                      <item.icon
                        size={16}
                        style={{ color: active ? '#FFFFFF' : '#4A5D23' }}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            fontSize: 13,
                            fontWeight: active ? 700 : 500,
                            color: active ? '#4A5D23' : '#2C3325',
                            flex: 1,
                            zIndex: 1,
                            letterSpacing: active ? '-0.01em' : '0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            marginLeft: 10,
                            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif'
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                      {!isCollapsed && active && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          style={{ zIndex: 1 }}
                        >
                          <ChevronRight size={14} style={{ color: '#4A5D23' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer & Controls */}
        <div>
          {/* Theme Switcher Button */}
          <div style={{ padding: '0 10px', marginBottom: 8 }}>
            <motion.button
              onClick={toggleTheme}
              style={{
                width: '100%',
                background: '#F4F6F0',
                border: 'none',
                color: '#2C3325',
                borderRadius: 14,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: isCollapsed ? 0 : 10,
                paddingRight: isCollapsed ? 0 : 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                overflow: 'hidden',
              }}
              className="hover:bg-[#E4E7D3] transition-colors"
              title={isCollapsed ? 'Toggle Theme' : undefined}
            >
              <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {theme === 'dark' ? (
                  <Sun size={16} style={{ color: '#4A5D23' }} />
                ) : (
                  <Moon size={16} style={{ color: '#4A5D23' }} />
                )}
              </div>
              
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', marginLeft: 10 }}
                  >
                    {theme === 'dark' ? 'Light Theme' : 'Olive Mode'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Session & Logout Footer */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              padding: isCollapsed ? '12px 0 16px' : '12px 10px 16px',
              borderTop: '1px solid #F4F6F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <LogoutButton isCollapsed={isCollapsed} />
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    width: '100%',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <ShieldAlert size={12} style={{ color: '#8A9380' }} />
                  <span style={{ fontSize: 10, color: '#8A9380', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Secure Staff Session
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Toggle Collapse Button on Desktop */}
        {!isMobile && (
          <button
            onClick={handleToggleCollapse}
            style={{
              position: 'absolute',
              right: -13,
              top: 24,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#4A5D23',
              border: '2.5px solid #FFFFFF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(74, 93, 35, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="hover:scale-115 active:scale-95"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </motion.aside>
    </>
  )
}
