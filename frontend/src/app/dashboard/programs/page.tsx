import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { programs } from "@/data/seed"
import { GraduationCap, Clock, Users, CalendarDays, CheckCircle, ArrowRight } from "lucide-react"

const enrolledPrograms = [
  {
    program: programs[0],
    status: "In Progress" as const,
    progress: 75,
    currentWeek: 3,
    totalWeeks: 4,
    nextMilestone: "Complete Founder Scorecard questionnaire",
    completedMilestones: [
      "1-on-1 onboarding call",
      "Profile optimization session",
      "Platform walkthrough",
    ],
  },
  {
    program: programs[1],
    status: "Enrolled" as const,
    progress: 0,
    currentWeek: 0,
    totalWeeks: 12,
    nextMilestone: "Cohort kickoff — April 22",
    completedMilestones: [],
  },
]

const enrolledProgramIds = new Set(enrolledPrograms.map((ep) => ep.program.id))

export default function ProgramsPage() {
  const availablePrograms = programs.filter((p) => !enrolledProgramIds.has(p.id))

  return (
    <div className="max-w-4xl space-y-6">
      <Tabs defaultValue="enrolled">
        <TabsList>
          <TabsTrigger value="enrolled">My Programs ({enrolledPrograms.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availablePrograms.length})</TabsTrigger>
        </TabsList>

        {/* Enrolled Programs */}
        <TabsContent value="enrolled" className="mt-6 space-y-6">
          {enrolledPrograms.map(({ program, status, progress, currentWeek, totalWeeks, nextMilestone, completedMilestones }) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#0A1628] text-lg">{program.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{program.category} · {program.duration}</p>
                  </div>
                  <Badge variant={status === "In Progress" ? "gold" : "secondary"}>
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{program.description}</p>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">
                      Week {currentWeek} of {totalWeeks}
                    </span>
                    <span className="font-semibold text-[#0A1628]">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                {/* Next milestone */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F8F5EF]">
                  <ArrowRight className="h-4 w-4 text-[#C9A84C] shrink-0" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Next:</span> {nextMilestone}
                  </span>
                </div>

                {/* Completed milestones */}
                {completedMilestones.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Completed
                    </p>
                    {completedMilestones.map((milestone) => (
                      <div key={milestone} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {milestone}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Available Programs */}
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
                  {program.isOpen ? (
                    <Badge variant="success">Open</Badge>
                  ) : (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{program.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {program.duration}
                  </span>
                  {program.cohortSize && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Cohort of {program.cohortSize}
                    </span>
                  )}
                  {program.applicationDeadline && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Deadline: {new Date(program.applicationDeadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Target stages */}
                <div className="flex flex-wrap gap-2">
                  {program.targetStage.map((stage) => (
                    <Badge key={stage} variant="outline">
                      {stage}
                    </Badge>
                  ))}
                </div>

                <Separator />

                {/* Benefits */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    What You Get
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {program.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {program.isOpen ? (
                    <Button>Apply Now</Button>
                  ) : (
                    <Button variant="outline" disabled>
                      Applications Opening Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
