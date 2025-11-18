import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { X } from 'lucide-react'
import type { Project } from '@/types/database.types'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsApi } from '@/services/api/projects.api'
import { useEffect, useState } from 'react'
import { Loader } from '@/components/ui/loader'
import { Calendar, CalendarClock } from 'lucide-react'

// { project }: { project: Project }
export const ProjectDetails = () => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const getProject = async (id: string) => {
    try {
      const data = await projectsApi.getById(id)
      setProject(data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getProject(id)
    }
  }, [id])

  const handleClose = () => {
    navigate('/projects')
  }

  return (
    <Drawer direction="right" open={true} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="md:max-w-[70%]! lg:max-w-[50%]!">
        <DrawerHeader className="p-0">
          <div className="bg-accent flex items-center justify-between p-2">
            <DrawerTitle className="text-lg font-semibold">Project Details</DrawerTitle>
            <DrawerClose asChild onClick={handleClose}>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <X />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        {!loading ? (
          <>
            <div className="p-4">
              <Field className="mb-5">
                <FieldSet>
                  <FieldLegend className="text-foreground mb-2">Project Name</FieldLegend>
                  <FieldDescription className="text-foreground flex items-baseline justify-between">
                    {project.name}
                    <span
                      className={`ml-5 flex rounded-full px-2 py-1.5 text-xs/2 ${
                        project.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : project.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'on-hold'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {project.status}
                    </span>
                  </FieldDescription>
                </FieldSet>
              </Field>
              <Field className="mb-5">
                <FieldSet>
                  <FieldLegend className="text-foreground mb-2">Project Description</FieldLegend>
                  <FieldDescription
                    className={`${project.description ? 'text-foreground line-clamp-3' : 'text-muted-foreground'} `}
                  >
                    {project.description || 'No description'}
                  </FieldDescription>
                </FieldSet>
              </Field>
              <div className="mb-5 flex">
                <Field>
                  <FieldSet>
                    <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                      <Calendar size={16} className="mr-1" />
                      Start Date
                    </FieldLegend>
                    <FieldDescription
                      className={`${project?.start_date ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No end date'}
                    </FieldDescription>
                  </FieldSet>
                </Field>
                <Field>
                  <FieldSet>
                    <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                      <Calendar size={16} className="mr-1" />
                      End Date
                    </FieldLegend>
                    <FieldDescription className={`${project?.end_date ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No end date'}
                    </FieldDescription>
                  </FieldSet>
                </Field>
              </div>
              <Field className="mb-5">
                <FieldSet>
                  <FieldLegend className="text-foreground mb-2">Tasks</FieldLegend>
                  <FieldDescription className="text-foreground text-justify">No tasks yet</FieldDescription>
                </FieldSet>
              </Field>
              <Field className="mb-5">
                <FieldSet>
                  <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                    <CalendarClock size={16} className="mr-1" />
                    Created At
                  </FieldLegend>
                  <FieldDescription className={`${project?.created_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {new Date(project.created_at).toLocaleString()}
                  </FieldDescription>
                </FieldSet>
              </Field>
            </div>
            <DrawerFooter></DrawerFooter>
          </>
        ) : (
          <Loader />
        )}
      </DrawerContent>
    </Drawer>
  )
}
