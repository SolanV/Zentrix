import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription>
              There was a problem authenticating. Please try logging in again.
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
