import { useState } from "react";
import { useGetAllCategories, useDeleteCategory, useCreateCategory, useUpdateCategory } from "@/features/focus/queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "@/features/focus/queries/query-keys";
import { createFileRoute } from "@tanstack/react-router";
import {
  Pencil,
  Trash2,
  Plus,
  Waves,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_pathlessLayout/waves")({
  component: RouteComponent,
});

const PRESET_COLORS = [
  "#02367b",
  "#0078d4",
  "#0496c7",
  "#04bade",
  "#2E5283",
  "#6F8D6A",
  "#A6BE47",
  "#E3BD33",
  "#FFCA5C",
  "#e76f51",
  "#E2552D",
  "#F0686C",
  "#C67FAE",
  "#512C3A",
  "#343148",
  "#717388",
];

const formSchema = z.object({
  name: z.string().min(2, "Wave must be at least 2 characters."),
  color: z.string().min(2, "Select a color."),
});

function WaveForm({
  category,
  onSuccess,
  onCancel,
}: {
  category?: { id: string; name: string; color: string };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: createCategoryAsync } = useCreateCategory();
  const { mutateAsync: updateCategoryAsync } = useUpdateCategory();
  const isEdit = !!category;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: category || { name: "", color: PRESET_COLORS[0] },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const mutation = isEdit
      ? updateCategoryAsync(
          { id: category.id, ...values },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
              onSuccess();
            },
          }
        )
      : createCategoryAsync(values, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
            onSuccess();
          },
        });

    await toast.promise(mutation, {
      loading: isEdit ? "Updating wave..." : "Creating wave...",
      success: isEdit ? "Wave updated" : "Wave created",
      error: "Something went wrong",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Deep Work, Meetings"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Color</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={`size-8 rounded-md transition-all duration-100 flex items-center justify-center ${
                        field.value === color
                          ? "ring-2 ring-offset-2 ring-ocean-500 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {field.value === color && (
                        <Check size={14} className="text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-ocean-700 hover:bg-ocean-800">
            {isEdit ? "Save Changes" : "Create Wave"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useGetAllCategories();
  const { mutateAsync: deleteCategoryAsync } = useDeleteCategory();

  const [editCategory, setEditCategory] = useState<{ id: string; name: string; color: string } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteCategoryId) return;

    await toast.promise(
      deleteCategoryAsync(deleteCategoryId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
          setDeleteCategoryId(null);
        },
      }),
      {
        loading: "Deleting...",
        success: "Wave deleted",
        error: "Failed to delete",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container md:container-md py-8 md:py-12">
        <header className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </header>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container md:container-md py-8 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-medium text-ocean-700/80 uppercase tracking-widest mb-2">
          Manage
        </p>
        <h1 className="font-original-surfer text-4xl text-ocean-900">
          Your Waves
        </h1>
        <p className="text-muted-foreground mt-2">
          Organize your focus sessions by topic or project.
        </p>
      </header>

      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowCreateDialog(true)} className="bg-ocean-700 hover:bg-ocean-800 gap-2">
          <Plus size={16} />
          Create Wave
        </Button>
      </div>

      {categories?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-muted/20">
          <div className="flex size-14 items-center justify-center rounded-full bg-ocean-700/8 text-ocean-700 mx-auto mb-4">
            <Waves size={28} />
          </div>
          <p className="text-base font-medium text-foreground mb-2">
            No waves yet.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first wave to organize your focus sessions.
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-ocean-700 hover:bg-ocean-800">
            Create your first wave
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:border-ocean-200 transition-colors"
            >
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div
                  className="size-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditCategory(category)}
                  className="size-8 text-muted-foreground hover:text-ocean-700 hover:bg-ocean-700/8"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteCategoryId(category.id)}
                  className="size-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Wave</DialogTitle>
            <DialogDescription>
              Give your wave a name and choose a color.
            </DialogDescription>
          </DialogHeader>
          <WaveForm
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wave</DialogTitle>
            <DialogDescription>
              Update the name or color of your wave.
            </DialogDescription>
          </DialogHeader>
          {editCategory && (
            <WaveForm
              category={editCategory}
              onSuccess={() => setEditCategory(null)}
              onCancel={() => setEditCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wave?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this wave. Sessions using this wave will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}