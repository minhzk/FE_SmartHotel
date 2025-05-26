'use client'
import { SessionProvider } from "next-auth/react"

export default function NextAuthWrapper({
    children,
    session
}: {
    children: React.ReactNode,
    session?: any
}) {
    return (
        <SessionProvider session={null}>
            {children}
        </SessionProvider>
    )
}