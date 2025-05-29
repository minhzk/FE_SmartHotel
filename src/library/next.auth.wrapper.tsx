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
        <SessionProvider 
            session={session}
            basePath="/api/auth"
            refetchInterval={300} // Refresh every 5 minutes
            refetchOnWindowFocus={true}
        >
            {children}
        </SessionProvider>
    )
}