import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { allProcessStepsQuery, deleteProcessStep, upsertProcessStep } from "@/lib/queries";
import type { ProcessStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/process")({ component: AdminProcess });

const schema = z.object({
  num: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  sort_order: z.number(),
});
type FormData = z.infer<typeof schema>;

function AdminProcess() {
  const queryClient = useQueryClient();
  const { data: steps = [] } = useQuery(allProcessStepsQuery());
  const [editing, setEditing] = useState<ProcessStep | null | "new">(null);

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteProcessStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-steps"] });
      toast.success("Step deleted");
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">Our Process</h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Define the step-by-step process shown in the "How It Works" section.
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add step
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-12 text-center">
          <p className="text-sm text-[#8B6B3D]">
            No steps yet. The process section will be hidden until you add at least one step.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex items-start gap-4 rounded-xl border bg-white p-4 border-[rgba(26,16,8,0.08)]"
            >
              <span className="mt-0.5 font-mono text-2xl font-light text-[#C9A96E]/40 select-none w-10 shrink-0">
                {step.num}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1a1008]">{step.title}</h3>
                <p className="mt-1 text-sm text-[#6b5a4a] line-clamp-2">{step.description}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-[#6b5a4a] hover:text-[#1a1008]"
                  onClick={() => setEditing(step)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-[#6b5a4a] hover:text-red-600"
                  onClick={() => { if (confirm("Delete this step?")) doDelete(step.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <StepDialog
        open={editing !== null}
        step={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        sortOrder={steps.length}
      />
    </div>
  );
}

function StepDialog({
  open, step, onClose, sortOrder,
}: {
  open: boolean;
  step: ProcessStep | null;
  onClose: () => void;
  sortOrder: number;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      num: step?.num ?? String(sortOrder + 1).padStart(2, "0"),
      title: step?.title ?? "",
      description: step?.description ?? "",
      sort_order: step?.sort_order ?? sortOrder,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        num: step?.num ?? String(sortOrder + 1).padStart(2, "0"),
        title: step?.title ?? "",
        description: step?.description ?? "",
        sort_order: step?.sort_order ?? sortOrder,
      });
    }
  }, [open, step]);

  const { mutate: doSave, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      upsertProcessStep({ ...(step ? { id: step.id } : {}), ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process-steps"] });
      toast.success(step ? "Step updated" : "Step created");
      onClose();
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step ? "Edit step" : "New step"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => doSave(d))} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="num" render={({ field }) => (
                <FormItem>
                  <FormLabel>Number</FormLabel>
                  <FormControl><Input placeholder="01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Consult" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Describe what happens in this step…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
