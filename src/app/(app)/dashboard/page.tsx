// src/app/(app)/dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// ✅ Placeholder summary and metric cards
const summaryCards = [
  { title: "Total Members", value: "25", description: "Active members in the group" },
  { title: "Total Savings", value: "₵12,500", description: "Total contributions" },
  { title: "Pending Withdrawals", value: "₵1,200", description: "Awaiting approval" },
]

const metricCards = [
  { title: "Monthly Savings", value: "₵2,500" },
  { title: "Approved Withdrawals", value: "₵1,000" },
]

// ✅ Helper for status color
function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-500"
    case "Pending":
      return "bg-yellow-500"
    case "Inactive":
      return "bg-gray-400"
    default:
      return "bg-gray-200"
  }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])

  // ✅ Simulate fetching members
  useEffect(() => {
    setTimeout(() => {
      setMembers([
        { id: 1, name: "Alice Johnson", email: "alice@example.com", avatar: "", contributed: "₵500", status: "Active" },
        { id: 2, name: "Michael Smith", email: "michael@example.com", avatar: "", contributed: "₵300", status: "Pending" },
      ])
      setLoading(false)
    }, 1500)
  }, [])

  // ✅ Simulate seeding database
  const handleSeed = () => {
    setMembers([
      { id: 3, name: "John Doe", email: "john@example.com", avatar: "", contributed: "₵200", status: "Inactive" },
    ])
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {metricCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
          <CardDescription>An overview of your group members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contributed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading members...</TableCell>
                </TableRow>
              ) : members.length > 0 ? (
                members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.contributed}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
                        {member.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center space-y-4 py-8">
                    <p>No members found in the database.</p>
                    <Button onClick={handleSeed}>Seed Database</Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
