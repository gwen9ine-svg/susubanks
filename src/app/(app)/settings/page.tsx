import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex gap-2">
            <Button variant="outline">Reset</Button>
            <Button>Save Changes</Button>
        </div>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members & Roles</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="grid gap-6 pt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Group-level settings and information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group name</Label>
                  <Input id="group-name" defaultValue="Susu Collective Accra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="GHS">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS (Ghanaian Cedi)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadence">Contribution cadence</Label>
                   <Select defaultValue="monthly">
                    <SelectTrigger id="cadence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="default-amount">Default contribution amount</Label>
                  <Input id="default-amount" type="number" defaultValue="250" />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reminders">Reminders</Label>
                            <Switch id="reminders" defaultChecked />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="2fa">Two-factor authentication</Label>
                            <Switch id="2fa" defaultChecked />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                             <Select defaultValue="en">
                                <SelectTrigger id="language">
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-between">
                           <div>
                                <p className="font-medium">Archive cycle</p>
                                <p className="text-sm text-muted-foreground">Archive the current contribution cycle.</p>
                           </div>
                           <Button variant="destructive" size="sm">Archive</Button>
                       </div>
                        <div className="flex items-center justify-between">
                           <div>
                                <p className="font-medium">Delete group</p>
                                <p className="text-sm text-muted-foreground">Permanently delete this group and all its data.</p>
                           </div>
                           <Button variant="destructive" size="sm">Delete</Button>
                       </div>
                    </CardContent>
                 </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
