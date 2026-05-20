"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { mapProgram, type ApiProgram, type WrappedResponse } from "@/lib/content-api"
import type { Program, PaginatedResponse } from "@/types"
import { CheckCircle, Clock, GraduationCap, Users, CalendarDays } from "lucide-react"

type ProgramApplicationsResponse = {
  data: Array<{
    id: number
    status: string
    created_at: string
    program?: { data?: ApiProgram } | ApiProgram
  }>
}

function unwrapProgram(program?: { data?: ApiProgram } | ApiProgram): ApiProgram | undefined {
  if (!program) return undefined
  const wrapped = program as { data?: ApiProgram }
  if (wrapped.data) {
    return wrapped.data
  }
  return program as ApiProgram
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [applications, setApplications] = useState<ProgramApplicationsResponse["data"]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<ApiProgram> | WrappedResponse<ApiProgram[]>>("/programs"),
      api.get<ProgramApplicationsResponse>("/member/program-applications").catch(() => ({ data: [] })),
    ])
      .then(([programResponse, applicationResponse]) => {
        const items = Array.isArray((programResponse as WrappedResponse<ApiProgram[]>).data)
          ? (programResponse as WrappedResponse<ApiProgram[]>).data
          : (programResponse as PaginatedResponse<ApiProgram>).data
        setPrograms(items.map(mapProgram))
        setApplications(applicationResponse.data)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const appliedIds = useMemo(
    () =>
      new Set(
        applications
          .map((item) => unwrapProgram(item.program)?.id)
          .filter((value): value is number => Boolean(value))
      ),
    [applications]
  )

  const myPrograms = applications
  const availablePrograms = programs.filter((program) => !appliedIds.has(Number(program.id)))

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Tabs defaultValue="enrolled">
        <TabsList>
          <TabsTrigger value="enrolled">My Applications ({myPrograms.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availablePrograms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6 space-y-6">
          {myPrograms.length === 0 && <p className="text-sm text-gray-500">You have not applied to any programs yet.</p>}
          {myPrograms.map((entry) => {
            const program = unwrapProgram(entry.program)
            if (!program) return null
            const mapped = mapProgram(program)
            return (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#0A1628] text-lg">{mapped.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{mapped.category} · {mapped.duration}</p>
                    </div>
                    <Badge variant={entry.status === "submitted" ? "warning" : "secondary"}>{entry.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{mapped.description}</p>
                  <div className="rounded-lg bg-[#F8F5EF] px-4 py-3 text-sm text-gray-700">
                    Applied on {new Date(entry.created_at).toLocaleDateString("en-US")}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="available" className="mt-6 space-y-4">
          {availablePrograms.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#0A1628] text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-[#C9A84C]" />
                      {program.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{program.category}</p>
                  </div>
                  <Badge variant={program.isOpen ? "success" : "secondary"}>{program.isOpen ? "Open" : "Closed"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{program.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{program.duration}</span>
                  {program.cohortSize && <span className="flex items-center gap-1"><Users className="h-3 w-3" />Cohort of {program.cohortSize}</span>}
                  {program.applicationDeadline && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Deadline: {new Date(program.applicationDeadline).toLocaleDateString("en-US")}</span>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {program.targetStage.map((stage) => (
                    <Badge key={stage} variant="outline">{stage}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {program.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>

                <Button disabled={!program.isOpen}>Apply from Program Page</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
