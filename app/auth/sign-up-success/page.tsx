import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <MailCheck className="size-6" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link. Confirm your email, then
              log in to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href="/auth/login" />}
              className="w-full"
              nativeButton={false}
            >
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
