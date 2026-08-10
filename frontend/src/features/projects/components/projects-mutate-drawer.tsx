import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DatePicker } from '@/components/date-picker'
import { useCreateProject, useUpdateProject } from '@/features/projects/data/queries'
import { priorityOptions, statusOptions } from '@/features/projects/data/data'
import {
  dateStringToDate,
  dateToString,
  projectFormSchema,
  type Project,
  type ProjectFormValues,
  type ProjectPayload,
} from '@/features/projects/data/schema'
import { mapApiErrors } from '@/features/projects/lib/map-api-errors'

function getDefaults(project: Project | null): ProjectFormValues {
  if (project) {
    return {
      clientName: project.clientName,
      projectName: project.projectName,
      description: project.description ?? '',
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      dueDate: project.dueDate,
    }
  }
  return {
    clientName: '',
    projectName: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: '',
    dueDate: '',
  }
}

type ProjectsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Project | null
}

export function ProjectsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ProjectsMutateDrawerProps) {
  const isUpdate = !!currentRow
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: getDefaults(currentRow),
    mode: 'onChange',
  })

  useEffect(() => {
    if (open) {
      form.reset(getDefaults(currentRow))
    }
  }, [open, currentRow, form])

  function onSubmit(values: ProjectFormValues) {
    const payload: ProjectPayload = {
      clientName: values.clientName,
      projectName: values.projectName,
      description: values.description ?? '',
      status: values.status,
      priority: values.priority,
      startDate: values.startDate,
      dueDate: values.dueDate,
    }

    if (isUpdate && currentRow) {
      updateMutation.mutate(
        { uuid: currentRow.uuid, payload },
        {
          onSuccess: () => {
            toast.success('Project updated.')
            onOpenChange(false)
          },
          onError: (error) => mapApiErrors(error, form),
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Project created.')
          onOpenChange(false)
        },
        onError: (error) => mapApiErrors(error, form),
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col h-full p-0 sm:max-w-md overflow-hidden'>
        <SheetHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
          <SheetTitle>{isUpdate ? 'Edit project' : 'New project'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the project details below.'
              : 'Add a new client project to the tracker.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='projects-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4'
          >
            <FormField
              control={form.control}
              name='clientName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Acme Corporation' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='projectName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Website Redesign' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Optional project details…'
                      className='min-h-24 resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select priority' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={dateStringToDate(field.value)}
                        onSelect={(date) => field.onChange(dateToString(date))}
                        placeholder='Pick a date'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={dateStringToDate(field.value)}
                        onSelect={(date) => field.onChange(dateToString(date))}
                        placeholder='Pick a date'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <SheetFooter className='px-6 py-4 border-t shrink-0 bg-background mt-auto'>
          <Button
            form='projects-form'
            type='submit'
            disabled={isPending}
            className='w-full'
          >
            {isPending
              ? 'Saving…'
              : isUpdate
                ? 'Save changes'
                : 'Create project'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
