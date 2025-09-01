
// src/app/(app)/dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getCollection, seedDatabase } from "@/services/firestore"

const parseAmount = (amount: string): number => {
    if (!amount || typeof amount !== 'string') return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

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
  const [summaryCards, setSummaryCards] = useState([
    { title: "Total Registered Users", value: "0", description: "Total number of registered users" },
    { title: "Total Groups", value: "6", description: "Number of active groups" },
  ])

  const [metricCards, setMetricCards] = useState([
    { title: "Approved Withdrawals", value: formatCurrency(0) },
  ]);

  async function fetchData() {
    setLoading(true);

    const memberData = await getCollection('members');
    const transactionData = await getCollection('transactions');

    const totalMembers = memberData.length;
    
    const approvedWithdrawals = transactionData
        .filter((tx: any) => tx.type === 'Withdrawal' && (tx.status === 'Approved' || tx.status === 'Completed'))
        .reduce((acc: number, tx: any) => acc + parseAmount(tx.amount), 0);

    setSummaryCards([
        { title: "Total Registered Users", value: totalMembers.toString(), description: "Total number of registered users" },
        { title: "Total Groups", value: "6", description: "Number of active groups" },
    ]);

    setMetricCards([
        { title: "Approved Withdrawals", value: formatCurrency(approvedWithdrawals) },
    ]);
    
    setMembers(memberData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [])
  
  const handleSeed = async () => {
    setLoading(true);
    await seedDatabase();
    await fetchData();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricCards[0].value}</div>
            </CardContent>
          </Card>
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
